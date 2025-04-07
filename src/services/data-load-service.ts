import { Readable } from "node:stream";
import csv from "csv-parser";
import { ServiceError } from "../errors/service-error";
import { DownloadServiceError, UploadServiceError } from "../errors/code-errors";
import { UploadRepository } from "../repositories/interface/upload-repository";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import iconv from 'iconv-lite';
import { Multipart } from "@fastify/multipart"
import { uuid } from "../lib/uuid";
import { createArrayCsvStringifier } from "csv-writer";
import { createReadStream } from "node:fs";
import path from "node:path";
import { EventProcedure, EventType } from "../events/event";
import { UploadStatus } from "../@types/upload-status";
import logger from "../config/logger";
import { GoalIndicatorService } from "./goal-indicator-service";
import { t } from "i18next";
import { UserService } from "./user-service";
import readline from "readline"
import { env } from "../env";
import puppeteer from 'puppeteer';
import * as chardet from 'chardet';
import { AuthenticateService } from "./authenticate-service";

export interface RecordRow {
    [key: string]: string; // Define um tipo genérico para os registros do CSV
}

interface PreProcessingResult {
    status: boolean,
    files?: FilesReceived[],
    resume?: ResponseError[],
}

interface ResponseError {
    fileName: string,
    hasError: boolean,
    message?: string,
}

interface FilesReceived {
    fileName: string,
    fileBuffer: Buffer,
    hasError: boolean,
}

interface ProccessRow {
    fileName: string,
    row: RecordRow,
    uploadId: string,
    uploadErrorId: string,
    event: string,
}

interface CsvResult {
    records: RecordRow[];
    lineCount: number;
}

export class DataLoadService {

    constructor(
        private repository: UploadRepository,
        private event: EventProcedure,
        private goalService: GoalIndicatorService,
        private userService: UserService,
        private authenticateService: AuthenticateService
    ) { }

    /**
     * Função para gerar o PDF de uma página autenticada.
     * @param url URL da página que será convertida em PDF.
     * @param token Token de autenticação necessário para acessar a página.
     * @returns Buffer do PDF gerado.
     */
    generatePDF = async (url: string, token: string): Promise<Buffer> => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // Adiciona o token de autenticação no cabeçalho
            await page.setExtraHTTPHeaders({
                Authorization: `Bearer ${token}`,
            });

            // Define o viewport
            await page.setViewport({
                width: 800,
                height: 1200,
            });

            // Navega para a URL especificada
            await page.goto(url, { waitUntil: 'networkidle0' });

            // Injeta estilos para fundo personalizado
            await page.addStyleTag({
                content: `
                body {
                    background: url('https://example.com/background.png') no-repeat center center;
                    background-size: cover;
                }
            `,
            });

            // Gera o PDF com cabeçalho, rodapé e margens personalizadas
            const pdfBuffer = Buffer.from(await page.pdf({
                format: 'A4',
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: `
                <div style="font-size:10px; text-align:center; width:100%; padding:5px 0; color: #333;">
                    <span>Meu Cabeçalho Personalizado</span>
                </div>
            `,
                footerTemplate: `
                <div style="font-size:10px; text-align:center; width:100%; padding:5px 0; color: #333;">
                    Página <span class="pageNumber"></span> de <span class="totalPages"></span>
                </div>
            `,
                margin: {
                    top: '50mm', // Espaço para o cabeçalho
                    bottom: '20mm', // Espaço para o rodapé
                },
            }));

            await browser.close();
            return pdfBuffer;
        } catch (error) {
            // Lança o erro explicitamente para que ele seja tratado na rota
            throw new Error(`Erro ao gerar o PDF: ${error}`);
        }
    }

    processCsv = async (parts: AsyncIterableIterator<Multipart>, userId: string) => {
        // Pré-processa os arquivos e salva as partes em memória
        logger.info('Upload de arquivos .csv')
        const { status, files, resume } = await this.preProcessorCsv(parts);

        //Recuperar profile do usuário
        const { company_id } = await this.userService.getUserById(userId);

        // Realiza o processo dos arquivos com sucesso
        // Data constante para todos os arquivos de upload desta requisição
        const date = new Date();
        const uploadIds: Set<string> = new Set<string>();

        logger.info(`Fazendo a leitura de ${files?.length} arquivos em memória`);

        //Objeto que mapeia todas as linhas
        const readerRows: { [key: string]: ProccessRow[] } = {};
        for (const file of files as FilesReceived[]) {

            if (!file.hasError) {
                const result = await this.readCsv(file.fileBuffer);
                const uploadId = uuid();
                const uploadErrorId = uuid();

                for (const row of result.records) {
                    let event = row['TIPO_CADASTRO'];

                    // Se evento não for encontrado definir um evento de erro
                    if (!(event in EventType)) {
                        event = 'EVENT_NOT_FOUND'
                    }

                    // colocar todas as linhas em um objeto para executar em uma prioridade definida
                    if (!readerRows[event]) {
                        const obj: ProccessRow[] = [{ fileName: file.fileName, row: row, uploadId, event, uploadErrorId }];
                        readerRows[event] = obj;
                    } else {
                        const obj: ProccessRow[] = readerRows[event];
                        obj.push({ fileName: file.fileName, row: row, uploadId, event, uploadErrorId });
                    }
                }
            }
        }

        logger.info("Executando com prioridade")
        for await (const [key, _value] of Object.entries(EventType)) {

            //Executar as linhas de acordo com o evento
            if (readerRows[key] && key !== EventType.EVENT_NOT_FOUND) {

                logger.info('>>>>>>>>>>>>>>>>>>>>> ', key)

                for await (const item of readerRows[key]) {
                    //Executa procedimento de acordo com o evento
                    const result = await this.event.execute(item.event as EventType, item.row);

                    //Salvando resultado do processo
                    const entity = await this.repository.save({
                        company_id: company_id,
                        code: result.code,
                        uploadId: item.uploadId,
                        event: item.event,
                        fileName: item.fileName,
                        status: result.status,
                        date,
                        cells: { create: this.getCells(result.schema) }
                    });

                    uploadIds.add(entity.uploadId);
                }
            } else if (readerRows[key] && key === EventType.EVENT_NOT_FOUND) {
                logger.info('TRATAMENTO DOS ERROS >>>>>>>>>>>>>>>>>>>>> ', key)

                for await (const item of readerRows[key]) {
                    //Executa procedimento de acordo com o evento
                    const result = await this.event.execute(item.event as EventType, item.row);

                    //Salvando resultado do processo
                    const entity = await this.repository.save({
                        company_id: company_id,
                        code: result.code,
                        uploadId: item.uploadErrorId,
                        event: item.event,
                        fileName: item.fileName,
                        status: result.status,
                        date,
                        cells: { create: this.getCells(result.schema) }
                    });

                    uploadIds.add(entity.uploadId);
                }
            }

        }


        return { status, files: resume };
    }

    private preProcessorCsv = async (parts: AsyncIterableIterator<Multipart>): Promise<PreProcessingResult> => {
        logger.info("Pré processamento de arquivos CSV");

        const filesReceived: FilesReceived[] = [];
        const responseError: ResponseError[] = [];
        let preProcessingStatus = true;

        logger.info('Colocando arquivos na memória');
        for await (const part of parts) {

            if (part.type === 'file') {
                const fileName = part.filename;
                const fileBuffer = await part.toBuffer();
                let hasError = false;
                let message;

                logger.info(`Nome do arquivo: ${fileName}, tamanho: ${fileBuffer.length} bytes`);

                try {

                    if (fileBuffer.length > env.FILE_SIZE) {
                        throw new ServiceError(t('messages.file_too_large'),
                            UploadServiceError.ERROR_FILE_TOO_LARGE);
                    }

                    if (!fileName.endsWith(".csv")) {
                        throw new ServiceError(t('messages.only_csv_files_are_accepted'),
                            UploadServiceError.ERROR_FILE_EXTENSION_IS_NOT_ACCEPTED);
                    }

                    const { lineCount } = await this.readCsv(fileBuffer);
                    if (lineCount <= 0) {
                        throw new ServiceError(t('messages.file_is_empty'),
                            UploadServiceError.ERROR_FILE_IS_EMPTY);
                    }

                    filesReceived.push({ fileName, fileBuffer, hasError: false });

                } catch (error) {
                    hasError = true;
                    preProcessingStatus = false;
                    message = error instanceof Error ? error.message : 'Unknown error';
                }

                responseError.push({ fileName, hasError, message });
            }
        }

        return {
            status: preProcessingStatus,
            files: filesReceived,
            resume: responseError,
        };
    }

    readCsv = (fileBuffer: Buffer): Promise<CsvResult> => {
        return new Promise((resolve, reject) => {

            const results: RecordRow[] = [];
            let lineCount = 0;

            // Detecta o encoding do arquivo
            const detectedEncoding = chardet.detect(fileBuffer) || 'utf-8';
            logger.info(`Encoding detectado: ${detectedEncoding}`);

            // Se o encoding não for UTF-8, converte o buffer
            let utf8Buffer;
            if (detectedEncoding.toLowerCase() !== 'utf-8') {
                logger.info(`Convertendo ${detectedEncoding} para utf-8`)
                utf8Buffer = Buffer.from(iconv.decode(fileBuffer, detectedEncoding), 'utf-8')
            } else {
                utf8Buffer = fileBuffer;
            }
            logger.info(`Verificando encoding depois da convesão: ${chardet.detect(utf8Buffer)}`);

            // Validação inicial para verificar se é um CSV
            const isCsv = this.isCsvFormat(utf8Buffer);
            if (!isCsv) {
                return reject(new ServiceError(t('messages.file_is_not_valid'),
                    UploadServiceError.ERROR_THE_FILE_IS_NOT_VALID));
            }

            // Detecta o delimitador antes de criar o stream
            const delimiter = this.detectDelimiter(fileBuffer);

            const stream = Readable.from(utf8Buffer.toString('utf8'));
            stream
                .pipe(csv({ separator: delimiter, skipComments: true }))
                .on('data', (data: RecordRow) => {
                    results.push(data)
                    lineCount++;  // Incrementa o contador de linhas
                })
                .on('end', () => {
                    resolve({ records: results, lineCount });
                })
                .on('error', (error) => {
                    logger.error('Erro ao processar arquivo: %s', error.message)
                    reject(new ServiceError(t('messages.error_processing_file'),
                        UploadServiceError.ERROR_PROCESSING_CSV_FILE));
                });
        });
    };

    // Método auxiliar para verificar se o buffer é um CSV
    isCsvFormat(fileBuffer: Buffer): boolean {
        const fileContent = fileBuffer.toString('utf8');
        const lines = fileContent.split('\n').slice(0, 5); // Limita a verificação às primeiras linhas

        // Verifica se há delimitadores comuns de CSV nas primeiras linhas
        const hasCsvDelimiter = lines.some(line => line.includes(',') || line.includes(';') || line.includes('\t'));
        return hasCsvDelimiter;
    }

    private detectDelimiter = (fileBuffer: Buffer): string => {
        // Decodifica as primeiras linhas do buffer para texto
        const firstLine = iconv.decode(fileBuffer, 'utf8').split('\n')[0];
        // Verifica se a linha contém ',' ou ';'
        return firstLine.includes(',') ? ',' : ';';
    };

    private getCells = (obj: object) => {
        const cells: Prisma.CellEntityCreateWithoutSheetsInput[] = [];
        Object.entries(obj).forEach(([key, value]) => {
            const cell: Prisma.CellEntityCreateWithoutSheetsInput = {
                name: key,
                value: z.coerce.string().parse(value)
            };
            cells.push(cell);
        })
        return cells
    }


    getUploadStatus = async (uploadId: string, userId: string) => {

        //Recuperar profile do usuário
        const { company_id } = await this.userService.getUserById(userId);

        let date: Date = new Date();
        let uploadCode: string = '';
        let uploadTotal = 0;
        let uploadSuccess = 0;
        let uploadError = 0;
        let fileName: string = '';

        const uploadList = await this.repository.getByUploadId(uploadId);
        uploadList.filter(item => item.company_id === company_id).forEach(async item => {

            uploadCode = this.getUploadType(item.code);
            date = item.date;
            fileName = item.fileName;

            if (item.status) {
                uploadSuccess += 1;
            } else {
                uploadError += 1;
            }
            uploadTotal += 1;
        });

        const status = {
            uploadId,
            uploadCode,
            fileName,
            uploadTotal,
            uploadSuccess,
            uploadError,
            date,
        }

        return status;
    }

    async getUploadStatusBatch(uploadIds: string[], userId: string): Promise<UploadStatus[]> {
        const { company_id } = await this.userService.getUserById(userId);

        const uploadList = await this.repository.getByUploadIds(uploadIds); // Use um novo método para buscar vários IDs de uma vez.

        return uploadIds.map(uploadId => {
            const filteredItems = uploadList.filter(item => item.uploadId === uploadId && item.company_id === company_id);

            let date: Date = new Date();
            let uploadCode: string = '';
            let uploadTotal = 0;
            let uploadSuccess = 0;
            let uploadError = 0;
            let fileName: string = '';

            filteredItems.forEach(item => {
                uploadCode = this.getUploadType(item.code);
                date = item.date;
                fileName = item.fileName;

                if (item.status) {
                    uploadSuccess += 1;
                } else {
                    uploadError += 1;
                }
                uploadTotal += 1;
            });

            return {
                uploadId,
                uploadCode,
                fileName,
                uploadTotal,
                uploadSuccess,
                uploadError,
                date,
            };
        });
    }


    async getCsv(userId: string, uploadId: string) {

        //Monta o csv apenas com os registros com erro
        const uploadsByCode = await this.repository.getUploadByIdWhereStatusIsFalse(uploadId);
        let template: string = '';
        let header: string[] = [];
        const records: string[][] = []

        await uploadsByCode.forEach(up => {
            template = up.code;
            header = up.cells.filter(item => item.name !== 'status').map(cell => cell.name);
            const line = up.cells.filter(item => item.name !== 'status').map(cell => cell.value === undefined || cell.value === null || cell.value === 'NaN' ? '' : cell.value);
            records.push(line);
        });

        header = this.formatHeaders(header);

        // Gera o CSV como string
        const csvStringifier = createArrayCsvStringifier({ header, fieldDelimiter: ';' })

        const headerString = csvStringifier.getHeaderString();
        const recordsString = csvStringifier.stringifyRecords(records);

        // Linhas extras no topo do arquivo
        const { role } = await this.authenticateService.getProfile(userId);
        const { fileStream } = await this.getFile(role, template);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity, // para suportar arquivos com diferentes tipos de final de linha (Windows e Unix)
        });

        const lines: string[] = [];
        for await (const line of rl) {
            lines.push(line);
            if (lines.length === 2) {
                rl.close(); // Interrompe o stream após ler duas linhas
                break; // Sai do loop para evitar ler o restante do arquivo
            }
        }
        fileStream.close(); // Garante que o stream é fechado

        let extraLines = '';
        for (const line of lines) {
            extraLines += line + '\n'
            logger.info('extraLines: ', extraLines)
        }
        // fim extra lines

        let csvName = 'EDSF.csv'
        try {
            csvName = this.getCsvName(template);
        } catch (_error) {
            // ignora erro e deixa o nome default
        }

        // Retorna o CSV completo (cabeçalho + registros)
        return {
            csvName,
            csv: extraLines + headerString + recordsString
        };
    }

    getFile = async (role: string, template: string) => {

        console.log('role: ', role)

        const prohibed = ['COURSE', 'WORKER_COURSE', 'INDICATOR_COURSE', 'INDICATOR', 'COMPANY'];

        if (role !== 'admin' && prohibed.includes(template)) {
            console.log("Proibido")
            throw new ServiceError(t('error.csv_template_is_restricted', { template }),
                DownloadServiceError.ERROR_CSV_TEMPLATE_IS_RESTICTED)
        }

        const csvName = this.getCsvName(template);

        // // Define o caminho para o arquivo .csv
        const csvFilePath = path.resolve(process.cwd(), 'csv/templates/', csvName);

        // Faz o streaming do arquivo .csv
        const fileStream = createReadStream(csvFilePath);

        return { csvName, fileStream };
    }

    private getCsvName = (template: string) => {

        let csvName: string;

        template = template.toUpperCase();
        if (template === "COURSE") {
            csvName = 'EDSF NOVO_CURSO.csv';
        } else if (template == "GOAL") {
            csvName = 'EDSF NOVA_META.csv';
        } else if (template == "WORKER_COURSE") {
            csvName = 'EDSF NOVO_TRABALHADOR_CURSO.csv';
        } else if (template == "INDICATOR_COURSE") {
            csvName = 'EDSF NOVO_INDICADOR_CURSO.csv';
        } else if (template == "INDICATOR") {
            csvName = 'EDSF NOVO_INDICADOR.csv';
        } else if (template == "COMPANY") {
            csvName = 'EDSF NOVA_ORG.csv';
        } else if (template == "PRODUCER") {
            csvName = 'EDSF NOVO_PRODUTOR.csv';
        } else if (template == "INDICATOR_VALUE") {
            csvName = 'EDSF NOVO_VALOR_INDICADOR.csv';
        } else if (template == "EVENT_NOT_FOUND") {
            csvName = 'EDSF.csv';
        } else {
            throw new ServiceError(t('messages.csv_template_not_found'),
                DownloadServiceError.ERROR_CSV_TEMPLATE_NOT_FOUND)
        }

        return csvName;
    }

    listUploadStatus = async (userId: string) => {
        const { company_id } = await this.userService.getUserById(userId);

        const uploads = await this.repository.findAllUploadByComapnyIdDistinctByUploadId(company_id);
        let uploadStatus: UploadStatus[] = [];
        let lastUploadStatus: UploadStatus[] = [];

        const allUploadStatus = await this.getUploadStatusBatch(uploads.map(u => u.uploadId), userId);

        allUploadStatus.sort((a, b) => b.date.getTime() - a.date.getTime());

        if (allUploadStatus[0]) {
            const lastUpload = allUploadStatus[0];
            const lastUploadDate = lastUpload.date.getTime();
            lastUploadStatus = allUploadStatus.filter(item => item.date.getTime() === lastUploadDate);
            uploadStatus = allUploadStatus.filter(item => item.date.getTime() !== lastUploadDate);
        }

        return { uploadStatus, lastUploadStatus };
    };


    private formatHeaders = (header: string[]): string[] => {

        const csvHeadersPattern = new Map();

        //Global
        csvHeadersPattern.set('event', 'TIPO_CADASTRO')
        csvHeadersPattern.set('status', 'STATUS_UPLOAD')
        csvHeadersPattern.set('error', 'ERRO_PROCESSAMENTO')

        //Meta
        csvHeadersPattern.set('goalCode', 'CODIGO_META')
        csvHeadersPattern.set('producerCode', 'CODIGO_PRODUTOR')
        csvHeadersPattern.set('codeIndicator', 'CODIGO_INDICADOR')
        csvHeadersPattern.set('goalYear', 'ANO_META')
        csvHeadersPattern.set('goal', 'META')

        //Nova org
        csvHeadersPattern.set('codeCompany', 'CODIGO_ORGANIZACAO')
        csvHeadersPattern.set('companyDescription', 'DESC_ORGANIZACAO')
        csvHeadersPattern.set('businessSegment', 'SEGMENTO_NEGOCIO')

        //novo curso
        csvHeadersPattern.set('courseCode', 'CODIGO_CURSO')
        csvHeadersPattern.set('courseDescription', 'DESC_CURSO')
        csvHeadersPattern.set('numberClass', 'QTD_AULAS')
        csvHeadersPattern.set('averageDuration', 'DURACAO_MÉDIA')

        //Novo indicador/curso
        csvHeadersPattern.set('indicatorCode', 'CODIGO_INDICADOR')
        csvHeadersPattern.set('courseCode', 'CODIGO_CURSO')

        //Indicador
        csvHeadersPattern.set('indicatorCode', 'CODIGO_INDICADOR')
        csvHeadersPattern.set('indicatorDescription', 'DESC_INDICADOR')
        csvHeadersPattern.set('companyCode', 'CODIGO_ORGANIZACAO')

        //novo produtor
        csvHeadersPattern.set('codeProducer', 'CODIGO_PRODUTOR')
        csvHeadersPattern.set('producerDescription', 'DESC_PRODUTOR')
        csvHeadersPattern.set('city', 'CIDADE')
        csvHeadersPattern.set('state', 'UF')
        csvHeadersPattern.set('compayCode', 'CODIGO_ORGANIZACAO')

        //Trabalhador / curso
        csvHeadersPattern.set('cpf', 'CPF')
        csvHeadersPattern.set('registrationDate', 'DATA_INSCRICAO')
        csvHeadersPattern.set('lastAccessDate', 'DATA_ULT_ACESSO')
        csvHeadersPattern.set('completionDate', 'DATA_CONCLUSAO')
        csvHeadersPattern.set('cityName', 'CIDADE')
        csvHeadersPattern.set('uf', 'UF')


        //Valor indicador
        csvHeadersPattern.set('producerCode', 'CODIGO_PRODUTOR')
        csvHeadersPattern.set('indicatorCode', 'CODIGO_INDICADOR')
        csvHeadersPattern.set('indicatorValue', 'VALOR_INDICADOR')
        csvHeadersPattern.set('summaryGrouper', 'ANO_SUMARIZACAO')

        // header.filter(item => item !== 'status');   
        header = header.map(name => {
            logger.info(name, '=>', csvHeadersPattern.get(name));
            if (csvHeadersPattern.has(name)) {
                return csvHeadersPattern.get(name);
            } else {
                return name;
            }
        });

        return header;
    }

    private readonly UPLOAD_CODES: Record<string, string[]> = {
        admin: [
            'COURSE',
            'GOAL',
            'WORKER_COURSE',
            'INDICATOR_COURSE',
            'COMPANY',
            'PRODUCER',
            'INDICATOR_VALUE',
            'INDICATOR'
        ],
        organization: [
            'PRODUCER',
            'GOAL',
            'INDICATOR_VALUE'
        ]
    };

    listUploadCodes(userRole: string): string[] {
        logger.debug('role: ', userRole);
        return this.UPLOAD_CODES[userRole] ?? [];
    }

    private getUploadType(code: string): string {
        let out = ''
        if (code === 'COURSE') {
            out = 'CURSO';
        } else if (code === 'GOAL') {
            out = 'INDICADOR META';
        } else if (code === 'WORKER_COURSE') {
            out = 'TRABALHADOR CURSO';
        } else if (code === 'INDICATOR_COURSE') {
            out = 'INDICADOR CURSO';
        } else if (code === 'COMPANY') {
            out = 'ORGANIZACAO';
        } else if (code === 'PRODUCER') {
            out = 'PRODUTOR';
        } else if (code === 'INDICATOR_VALUE') {
            out = 'VALOR INDICADOR';
        } else if (code === 'INDICATOR') {
            out = 'INDICADOR';
        } else {
            out = 'INVALIDO'
        }
        return out;
    }

    listAllUploads = async () => {
        return await this.repository.findAll();
    }

    calculatePercentageRealized = async () => {
        return await this.goalService.calculatePercentageRealized();
    }

}

