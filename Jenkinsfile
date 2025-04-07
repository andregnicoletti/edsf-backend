/************************************************************************************************************************************************************************
 * Jenkinsfile : Script para geração do produto
 *
 * Referências:
 * https://confluence.cpqd.com.br/display/TI/Jenkins+Pipeline
 * https://confluence.cpqd.com.br/pages/viewpage.action?pageId=125778141
 *
 ***********************************************************************************************************************************************************************

 /* Definição de classes importadas */
import groovy.transform.Field
import static groovy.json.JsonOutput.*

/* Para customizar limpeza Artifactory é preciso tratar nome build (HD-98253) */
@Field def BUILD_NAME_CUST = "customizacao nome da build - limpeza Artifactory"
@Field def BUILD_NUMBER_CUST = "1234"

/* Definição de variaveis para referenciar os scripts importados */
@Field def uGIT, uMail, uJira, uSonar, uParser, uSed, uXmlstarlet, uBuild, uDocker, uSecure

/* Definição de variaveis */
@Field def jenkins = [:]
@Field def versions = [:]
@Field def repo = [:]

/* Variaveis docker */
@Field def dockerInfo = [:]
/*
 * dockerInfo.Target
 * dockerInfo.Tag
 * dockerInfo.Image
 * dockerInfo.ImageUrl
 * dockerInfo.ImageClient
 * dockerInfo.ImageClientUrl
 */

@Field def baseStagesDocker = [
    'edsf-backend'
]

@Field def NODE_LINUX='oci-edsf-build'

@Field String encodeUrl

pipeline {

    agent { label NODE_LINUX }

    // triggers {  cron('45 7 * * 1-5') }

    options {
        skipDefaultCheckout()
        disableConcurrentBuilds()
        timeout(time: 180, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '30'))
    }

    // ATENCAO: É preciso executar uma primeira vez para que os parametros sejam criados para o job!!
    parameters {
        choice(
            name: 'BUILD_TYPE',
            description: 'Perfil de Compilação',
            choices: ['BUILD','TESTE_SISTEMICO','RELEASE_CANDIDATE','RELEASE','REBUILD','PULLREQUEST'],
        )
        string(
            name: 'STAGES',
            description: 'Lista dos stages. Opções: build-docker-images',
            defaultValue: 'build-docker-images'
        )
        string(
            name: 'STAGES_DOCKER',
            description:  'Imagens docker a serem geradas',
            defaultValue: 'edsf-backend'
        )
        string(
            name: 'CHECKOUT_POINT',
            description: 'Referência para clone do repositório: HEAD, LAST ou Tag específica',
            defaultValue: 'HEAD',
            trim: true
        )
        string(
            name: 'CONTAINER_REPO',
            description: 'Nome do repositório criado no Container Registry',
	    defaultValue: 'edsf',
            trim: true
        )
        choice(
            name: 'SONAR',
            description: 'Análise de código com Sonar',
            choices: ['ON','OFF'],
        )
        string(
            name: 'EMAIL',
            description: 'E-mails para divulgação',
            defaultValue: 'nomail@cpqd.com.br',
            trim: true,
        )
        validatingString(
            name: 'JIRA',
            description: 'Jira para passagem de Baseline de Release ou Release Candidate',
            defaultValue: 'EDSF-81',
            regex: '^$|.+-\\d+',
            failedValidationMessage: 'A solicitação do JIRA deve ser do projeto',
        )
        booleanParam(
            name: 'PROMOTE',
            defaultValue: true,
            description: 'Faz upload da imagem de RC ou Release para o Container Registry'
        )
        booleanParam(
            name: 'UNIT_TEST',
            defaultValue: true,
            description: 'Executa os testes unitários'
        )
    }

    environment {
        PRODUCT='IA-IOT'
        PROJECT='EDSF'
        REPOSITORY='jaentendi-edsf-backend'

        // Necessario declarar a localizacao dentro do container
        MAVEN_HOME = '/usr/share/maven'

        AMB_CREDENTIALS='ssh-key-for-jenkins-mercurio'
    }

    /* Inicio das tarefas para a compilação do produto */
    stages {

        /* Processa variáveis e parâmetros do Jenkins */
        stage ('Prepare') {
            steps {
                script {
                    /* Apagando area de geração */
                    cleanWs()

		    /* Verificando parametros de entrada */
                    jenkins = getProcessedParams(env.getEnvironment())

                    dir ('utils'){
                        checkout (changelog: false, poll: false, scm: [$class: 'GitSCM', branches: [[name: 'origin/master']], gitTool: 'Default-Git', userRemoteConfigs: [[credentialsId: 'ssh-password-ipadmin', url: 'https://bitbucket.cpqd.com.br/scm/gc/pipeline-utils.git']]])
			uGIT = load 'scripts/git.groovy'
			uMail = load 'scripts/mail.groovy'
			uJira = load 'scripts/jira.groovy'
			uSonar = load 'scripts/sonar-new.groovy'
			uParser = load 'scripts/parser-log.groovy'
			uSed = load 'scripts/sed.groovy'
			uXmlstarlet = load 'scripts/xmlstarlet-pom.groovy'
			uBuild = load 'scripts/build.groovy'
			uDocker = load 'scripts/docker.groovy'
			uSecure = load 'scripts/secure.groovy'
		    }

		    /* Clone de repositório do produto */
		    repo = uGIT.clone (
			url : "https://bitbucket.cpqd.com.br/scm/${env.PROJECT}/${env.REPOSITORY}.git",
			pointer : jenkins.POINTER,
			directory : 'repo'
		    )

		    /* Criação de TAG temporária do Jenkins */
		    uGIT.pushTag (directory : repo.DIR, tag : jenkins.JENKINS_TAG)

		    /* Definindo POINTER de clone para TAG auxiliar do jenkins */
		    jenkins.POINTER = jenkins.JENKINS_TAG

		    callPrepare()
		} // script
	    } // steps
	} // stage prepare

	/**
	 * Configurações para utilizar plugin Artifactory
	 */
	stage ('Artifactory Configuration') {
	    steps {
		script {
		    configureArtifactory()
		} // script
	    } // steps
	} // stage

	/**
	 * Inicio das tarefas de Build
	 *
	 * Stages de compilação : Todos os módulos
	 */

        stage('Unit Test') {
	    when {
		expression { jenkins.UNIT_TEST.toBoolean() == true }
	    }
            steps {
                script {
                    dir (repo.DIR) {
                        try {
//TO DO - ADICIONAR TESTE UNITÁRIO QUANDO DISPONÍVEL
// 			    sh """#!/bin/bash -xe
// pwd
// docker run -v ${WORKSPACE}/${repo.DIR}:/opt/dojot artifactory.cpqd.com.br/dockerhub/node:16-alpine /bin/sh \
// 							-c "cd /opt/dojot && \
// 							yarn && yarn test"
// find  ${WORKSPACE}/${repo.DIR}/coverage -type f
//                     """

                            currentBuild.result = "SUCCESS"
                            currentBuild.description = "Status: ${currentBuild.currentResult} | Duracao: ${currentBuild.durationString}"
			} catch (Exception err) {
                            currentBuild.result = 'FAILURE'
                            currentBuild.displayName = "Erro execução dos testes"
                            currentBuild.description = "Status: ${currentBuild.currentResult} | Duracao: ${currentBuild.durationString} | Erro: ${err}"
                            throw err
			}
                    }
		} // scripts
            } // steps
        } // stage

	/**
	 * Sonar (Análise do SonarQube)
	 */

	stage ('SonarQube Analysis') {
	    when {
		expression { jenkins.SONAR == true }
	    }
	    steps {
		script {
		    def projectKey="${env.PRODUCT.toLowerCase()}.${env.PROJECT.toLowerCase()}:${env.REPOSITORY}"

		    uSonar.scan (
			propertiesDir : "${WORKSPACE}/${repo.DIR}",
			sonarSuffix : jenkins.BRANCH,
			sonarVersion : "${versions.publish}",
			cmdargs:" -Dsonar.projectKey=${projectKey} -Dsonar.projectName=${projectKey}"
		    )
		} // script
	    } // steps
	} // stage

	stage("Quality Gate") {
	    when {
		expression { jenkins.SONAR == true }
	    }

	    steps {
		script {
		    sleep time: 30000, unit: 'MILLISECONDS'
		    try {
			def qg = waitForQualityGate()
			if (qg.status != 'OK') {
			    //			    error "Pipeline aborted due to quality gate failure: ${qg.status}"
			    println "Pipeline aborted due to quality gate failure: ${qg.status}"
			}
		    } catch (Exception err) {
			currentBuild.result = 'FAILURE'
			currentBuild.displayName = "Não passou no padrão de qualidade, verificar o sonar."
			currentBuild.description = "Status: ${currentBuild.currentResult} | Duracao: ${currentBuild.durationString} | Erro: ${err}"
			throw err
		    }
		} // script
	    } // steps
	} // stage

	/**
	 * Docker Images
	 */
	stage('Build Docker Images') {
	    when {
		expression { jenkins.STAGES.contains('build-docker-images') }
	    }

	    steps {
		script {
		    println "[TRACE] ====> baseStagesDocker"
		    println prettyPrint(toJson(baseStagesDocker))
		    baseStagesDocker.each {
			stage ("${it}") {
			    achou = false
			    jenkins.STAGES_DOCKER.each {
				if (it == STAGE_NAME) { achou = true }
			    }
			    if (achou) {
				println "****** ${it} *************************************"
				switch ("${it}") {
				    case 'edsf-backend':
					uDocker.buildImageRT (
					    dockerfile: 'Dockerfile',
					    imageName: "${dockerInfo.Image}/${it}:${dockerInfo.Tag}",
					    pathCode: "${WORKSPACE}/${repo.DIR}",
					    buildArgs: "--build-arg ARTIFACT_VERSION=${versions.image}",
					)
					break
				    default:
					uDocker.buildImageRT (
					    dockerfile: 'Dockerfile',
					    imageName: "${dockerInfo.Image}/${it}:${dockerInfo.Tag}",
					    pathCode: "${WORKSPACE}/${repo.DIR}/${it}",
					    buildArgs: "--build-arg ARTIFACT_VERSION=${versions.image}",
					)
					break
				}
			    } // if
			} // stage
		    } // each
		} // script
	    } // step
	} // stage

	stage('Push Docker Images') {
	    when {
		expression { jenkins.STAGES.contains('build-docker-images') && (jenkins.BUILD_OPTION == 'deploy')}
	    }
	    steps {
		script {
		    jenkins.STAGES_DOCKER.each {
			uDocker.pushImageRT (
			    imageName: "${dockerInfo.Image}/${it}:${dockerInfo.Tag}",
			    targetRepo: "${dockerInfo.Target}",
			    properties: "${PROJECT}-${REPOSITORY}"
			)
			if (jenkins.PROMOTE.toBoolean()) {
			    uDocker.promoteImage (
				imageName: "${dockerInfo.Image}/${it}:${dockerInfo.Tag}",
				imageNameCliente:" ${dockerInfo.ImageClient}/${it}:${dockerInfo.Tag}"
			    )
			}
		    } // each
		} // script
	    } // steps
	} // stage Push Docker Image to Artifactory


	/**
	 * Scan docker images with Trivy
	 */
	stage('Scan Trivy') {
	    when {
		expression { jenkins.STAGES.contains('build-docker-images') && (jenkins.BUILD_OPTION == 'deploy') }
	    }

	    steps {
		script {
		    ArrayList componentList1 = []
		    jenkins.STAGES_DOCKER.each {
			println "**** ${it}*****"
			componentList1.add ("${dockerInfo.Image}/${it}:${dockerInfo.Tag}")
		    }
		    println "[TRACE] componentList1"
		    println prettyPrint(toJson(componentList1))

		    uSecure.scanImage_Trivy ('reports', componentList1)

		    ArrayList componentList2 = []
		    jenkins.STAGES_DOCKER.each {
			println "**** ${it}*****"
			componentList2.add ('all')
		    }
		    println "[TRACE] componentList2"
		    println prettyPrint(toJson(componentList2))

		    uSecure.scanFS_Trivy ('reports2', "${repo.DIR}", componentList2)
		} // script
	    } // steps
	} // stage


	/**
	 * Geração de baselines
	 *      - Para baselines de Release há o commit de troca dos pom's para nova versão SNAPSHOT
	 *      - Para baselines de Release Candidate há o commit de troca dos pom's para versão SNAPSHOT inicial.
	 */
	stage ('Baseline') {
	    when {
		expression { jenkins.BASELINE }
	    }
	    steps {
		script {
		    /* URL's base */
		    String urlBaseChanges = "https://bitbucket.cpqd.com.br/projects/${env.PROJECT}/repos/${env.REPOSITORY}/compare/commits"

		    /* Commit de troca de pom's para a versão de Release e Release Candidate */
//		    if (jenkins.BUILD_TYPE =~ /^(RELEASE)$/) {
//			uGIT.pushFiles (
//			    directory : repo.DIR,
//			    files : versions.files,
//			    commitMsg : "[${jenkins.JIRA}] JENKINS :: Troca de versão para : ${versions.publish}"
//			)
//			setJobDisabled (true)
//		    }

		    /* Definição de URL's para e-mail's de divulgação */
		    def url = "artifactory.cpqd.com.br"

		    /* Marcação de TAG em repositório */
		    uGIT.pushTagNoForce (directory : repo.DIR, tag : "${versions.publish}")

		    /* Verifica ultima TAG para changelog em e-mail */
		    def nameLastTag = uBuild.getLastTag ("${versions.publish}", repo.DIR)

		    /* Envio de email para divulgação */
		    def changes = 'Baseline precedente não identificada'
		    if (nameLastTag){
			changes = "${urlBaseChanges}?targetBranch=${nameLastTag}&sourceBranch=${versions.publish}"
		    }

		    /* Emails adicionais para baselines de RELEASE */
		    if (jenkins.BUILD_TYPE =~ /^(RELEASE)$/) {
			jenkins.EMAIL += ',gcip@cpqd.com.br'
		    }

		    if (jenkins.PROMOTE.toBoolean()){
			/* Envio de e-mail para divulgação de baseline */
			uMail.sendBaselineWithURL (
			    subject : "[${env.PRODUCT}](${env.PROJECT}/${env.REPOSITORY}) Baseline ${jenkins.BUILD_TYPE}: ${versions.publish} (branch : ${jenkins.BRANCH})",
			    summary : "Baseline : ${jenkins.BUILD_TYPE} ${versions.publish} disponÃƒÂ­vel.",
			    mailList : jenkins.EMAIL,

			    argsPackages : [url],
			    urlChanges : changes,

			    argsVersions : [
				"${env.PROJECT}/${env.REPOSITORY}" : versions.publish
			    ],

			    argsInfo : [
				'Branch' : jenkins.BRANCH,
				'Commit' : repo.GIT_COMMIT,
				'Solicitante' : "${jenkins.BUILD_USER} (${jenkins.BUILD_USER_EMAIL})",
				'Tipo de compilação' : jenkins.BUILD_TYPE,
				'Baseline' : "${versions.publish}",
				'Log' : jenkins.BUILD_URL,
				'Docker Image 1' : "${dockerInfo.Image}:${dockerInfo.Tag}",
				'Docker Image Container Registry 1'  : "${dockerInfo.ImageClient}:${dockerInfo.Tag}",
				'Artifactory Info' : "${dockerInfo.rtUrl}"
			    ]
			)
		    } else {
			/* Envio de e-mail para divulgação de baseline */
			uMail.sendBaselineWithURL (
			    subject : "[${env.PROJECT}] Baseline : ${versions.publish} (branch : ${jenkins.BRANCH})",
			    summary : "Baseline : ${versions.publish} disponível.",
			    mailList : jenkins.EMAIL,

			    argsPackages : [url],
			    urlChanges : changes,

			    argsVersions : [
				"${env.PROJECT}" : versions.publish
			    ],

			    argsInfo : [
				'Branch' : jenkins.BRANCH,
				'Commit' : repo.GIT_COMMIT,
				'Lista de passos' : jenkins.STAGES,
				'Solicitante' : "${jenkins.BUILD_USER} (${jenkins.BUILD_USER_EMAIL})",
				'Tipo de compilação' : jenkins.BUILD_TYPE,
				'Baseline' : "${versions.publish}",
				'Log' : jenkins.BUILD_URL,
				'Docker Image 1' : "${dockerInfo.Image}:${dockerInfo.Tag}",
				'Artifactory Data' : "${encodeUrl}"
			    ]
			)
		    }

		    /* Troca para a proxima versão */
//		    if (jenkins.BUILD_TYPE =~ /^(REBUILD|RELEASE|RELEASE_CANDIDATE)$/) {
		    if (jenkins.BUILD_TYPE =~ /^(RELEASE)$/) {
			    versions.preview = versions.preview_snapshot

			if (jenkins.BUILD_TYPE == "RELEASE" && jenkins.CHECKOUT_POINT != 'HEAD') {
				println "ATENÇÃO: MUDANDO CHECKOUT PARA HEAD"

				repo = uGIT.clone (
				url : "https://bitbucket.cpqd.com.br/scm/${env.PROJECT}/${env.REPOSITORY}.git",
				pointer : jenkins.BRANCH,
				directory : 'repo'
				)
			} // BUILD_TYPE == "RELEASE" E CHECKOUT_POINT != 'HEAD'

			    println "[TRACE] 2 changeFilesVersion ${versions.publish} por ${versions.preview}"

			    /* Altera  versão em .env */
			    uSed.changeFilesVersion (
				directory : repo.DIR,
				oldValue : versions.publish,
				newValue : versions.preview,
				listFiles : versions.files
			    )

			    /* PUSH de versão SNAPSHOT */
			    uGIT.pushFiles (
				directory : repo.DIR,
				files : versions.files,
				commitMsg : "[${jenkins.JIRA}] JENKINS :: Troca de versão para : ${versions.preview}"
			    )

//			    setJobDisabled (false)
		    }

		    /* Altera nome de contrução no Jenkins */
		    buildName "${jenkins.BUILD_DISPLAY_NAME} - ${jenkins.BUILD_TYPE} ${versions.publish}"

		} // script
	    } // steps
	} // stage baseline

	/**
	 * Configurar limpeza de artefatos disponibilizados no Artifactory
	 */
	// stage ('Discard artifacts Config') {
	//     steps {
	// 	script {
	// 	    println "[TRACE] Discard artifacts... >${BUILD_NAME_CUST}< >${BUILD_NUMBER_CUST}<"
	// 	    if (jenkins.BUILD_TYPE != 'RELEASE' && jenkins.BUILD_TYPE != 'RELEASE_CANDIDATE' && jenkins.BUILD_TYPE != 'REBUILD'){
	// 		// TODO, adicionar tratativa para caso seja snapshot ou release (alterar políticas dependendo do tipo de imagem sendo gerado)
	// 		rtBuildInfo (
	// 		    // Captura variáveis de ambiente
	// 		    captureEnv: true,
	// 		    // Optional - Maximum builds to keep in Artifactory.
	// 		    maxBuilds: 3,
	// 		    // Optional - Maximum days to keep the builds in Artifactory.
	// 		    maxDays: 30,
	// 		    // Optional (the default is false) - Also delete the build artifacts when deleting a build.
	// 		    deleteBuildArtifacts: true,
	// 		    buildName: BUILD_NAME_CUST,
	// 		    buildNumber: BUILD_NUMBER_CUST
	// 		)
	// 	    } // if

	// 	    if (jenkins.BUILD_TYPE == 'RELEASE_CANDIDATE') {

	// 		// TODO, adicionar tratativa para caso seja snapshot ou release (alterar políticas dependendo do tipo de imagem sendo gerado)
	// 		rtBuildInfo (
	// 		    // Captura variáveis de ambiente
	// 		    captureEnv: true,
	// 		    // Optional - Maximum builds to keep in Artifactory.
	// 		    maxBuilds: 5,
	// 		    // Optional - Maximum days to keep the builds in Artifactory.
	// 		    maxDays: 30,
	// 		    // Optional (the default is false) - Also delete the build artifacts when deleting a build.
	// 		    deleteBuildArtifacts: true,
	// 		    buildName: BUILD_NAME_CUST,
	// 		    buildNumber: BUILD_NUMBER_CUST
	// 		)
	// 	    } // if
	// 	} // script
	//     } // steps
	// } // stage

	stage ('Publish build info') {
	    when {
		expression { jenkins.BUILD_OPTION == 'deploy' }
	    }
	    steps {
		rtPublishBuildInfo (
		    serverId: "ARTIFACTORY_SERVER",
		    buildName: BUILD_NAME_CUST,
		    buildNumber: BUILD_NUMBER_CUST
		)
	    }
	}
    } // stages
    post {
	always {
	    script {

		// pega email de quem disparou o job
		wrap([$class: 'BuildUser']) {
		    try {
			userEmail = "$BUILD_USER_EMAIL"
		    } catch (e){
			userEmail = 'nomail@cpqd.com.br'
                    }
		}

		echo 'One way or another, I have finished'
		currentBuild.result = currentBuild.result ?: 'SUCCESS'
		echo "Status: ${currentBuild.result}"
            }
	}
	success {
            echo 'I succeeeded!'
            script {
		mail to: params.EMAIL + ", ${userEmail}",
                    subject: "Pipeline ${env.PRODUCT} ${env.PROJECT} ${env.REPOSITORY} - ${jenkins.BUILD_TYPE}: ${currentBuild.fullDisplayName}",
                    mimeType: 'text/html',
                    body: """
<p><strong><span style="color: #008000;">Success</span></strong> ${currentBuild.fullDisplayName} ${env.BUILD_URL}</p>
<p><strong><span style="background-color: #ffff00;">Artifactory Data (realizar login):</span></strong>${encodeUrl}</p>
                 """
            }
	}
	unstable {
            echo 'I am unstable :/'
	}
	failure {
            echo 'I failed :('
            mail to: params.EMAIL + ", ${userEmail}",
		subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
		body: "Something is wrong with ${env.BUILD_URL}"
	}
	changed {
            echo 'Things were different before...'
	}
    } // post
} // pipelines

/**
 * Validação de parâmetros do Jenkins.
 *
 * Processa variaveis oriundas do jenkins, validando de acordo com as confugurações esperadas.
 * Também é criada novas variaveis : JENKINS_TAG, BASELINE, POINTER, BUILD_USER e BUILD_USER_EMAIL
 * Em caso de inconsistência nas variaveis, o script é encerrado.
 *
 * WARNINGS :
 *      - Esta função deve ter sua lógica alterada dependendo do produto.
 *
 * @param   jenkins_raw_hash : HashMap de variaveis do Jenkins
 * @return  HashMap de variaveis processadas.
 */
def getProcessedParams(jenkins_raw_hash) {

    HashMap jMap = jenkins_raw_hash

    /* Verifica se é a primeira execuçao e atribui valores default aos paramêtros de entrada */
    if (!jMap.BUILD_TYPE) {
	jMap.BUILD_TYPE='PULLREQUEST'
	jMap.STAGES='build-docker-images'
	jMap.STAGES_DOCKER='edsf-backend'
	jMap.CHECKOUT_POINT='HEAD'
	jMap.CONTAINER_REPO='edsf'
        jMap.SONAR='ON'
        jMap.EMAIL='nomail@cpqd.com.br'
        jMap.JIRA='EDSF-81'
        jMap.PROMOTE=false
        jMap.UNIT_TEST=true
    }

    if (BRANCH_NAME ==~ /^PR.+/) {
        println "Pull Request..."
        jMap.BRANCH="${CHANGE_BRANCH}"
        jMap.BUILD_TYPE='PULLREQUEST'
    } else {
        // Quando o plugin Multibranch é utilizado a variável BRANCH_NAME contém o nome do branch
        jMap.BRANCH="${BRANCH_NAME}"
    }

    /* ATENÇÃO: Faz deploy apenas em branch master, develop e release !!!!!!! */
    if (jMap.BRANCH ==~ /^(master|development|release\/.*)/) {
        jMap.BUILD_OPTION = 'deploy'
    } else {
        jMap.BUILD_OPTION = 'install'
    }

    /* Verifica o nome do branch - NÃO PODE FAZER DEPLOY em branch bugfix e hotfix para nÃ£o sobrescrever versão Base no Artifactory!! */
    if (jMap.BRANCH ==~ /^(bugfix|hotfix|PR)\/.*/ && env.BUILD_TYPE != "PULLREQUEST") {

        echo "[INFO] Branch não é 'bugfix|hotfix|feature/' mas 'BUILD_TYPE' não é 'PULLREQUEST'. O tipo de build está sendo alterado para essa execução."
        echo "[INFO] Novo BUILD_TYPE: 'PULLREQUEST'"
        buildDescription "[INFO] Novo BUILD_TYPE: 'PULLREQUEST'"
        jMap.BUILD_TYPE = "PULLREQUEST"
    }

    if (jMap.BUILD_TYPE =~ /^(PULLREQUEST)$/) {
        jMap.BUILD_OPTION='install'
        jMap.BUILD_TYPE = 'BUILD'
        buildDescription "[INFO] Novo BUILD_TYPE: 'BUILD'"
    }

    /**
     * Validação de variaveis
     */
    jMap.MAVEN_SETTINGS_UNIX="${SETTINGS_CPQD}"

    /* BUILD_TYPE : Verifica se é valido */
    jMap.BUILD_TYPE =~ /^(REBUILD|BUILD|RELEASE|RELEASE_CANDIDATE|TESTE_SISTEMICO|MERGE)$/ ? jMap.BUILD_TYPE : error ("[ERROR] Tipo de build invalida")

    /* STAGES : Verifica se todos os valores são válidos */
    def baseStages = ['build-docker-images','push-docker-images']

    ArrayList stages = jMap.STAGES.toLowerCase().split(/\s|,/)
    stages.removeAll{it == ''}
    if (stages){
        if (!baseStages.containsAll (stages)){
            stages.removeAll(baseStages)
            error "[ERROR] Há stages invalidos: ${stages}"
        }
    }
    jMap.STAGES = stages

    def baseStagesDocker = [
	'edsf-backend'
    ]

    //    ArrayList stages_docker = jMap.STAGES_DOCKER.toLowerCase().split(/\s|,/)
    ArrayList stages_docker = jMap.STAGES_DOCKER.split(/\s|,/)
    stages_docker.removeAll{it == ''}
    if (stages_docker){
        if (!baseStagesDocker.containsAll (stages_docker)){
            stages_docker.removeAll(baseStagesDocker)
            error "[ERROR] Há stages docker invalidos: ${stages_docker}"
        }
    }
    jMap.STAGES_DOCKER = stages_docker

    /* SONAR : Valida configurações das variaveis referentes ao Sonar*/
    jMap.SONAR = jMap.SONAR.equals('ON')

    println prettyPrint(toJson(jMap))

    /* JIRA : Verifica Nessecidade de Jira para compilações do tipo RELEASE e RC */
    //    if (jMap.BUILD_TYPE =~ /^(RELEASE|RELEASE_CANDIDATE)$/) {
    //  if (! jMap.JIRA.contains ('PGA')){
    //            error "[ERROR] Jira é necessário para compilações de RELEASE e RC"
    //  }
    //    }

    /**
     * Criação de novas variaveis
     */

    /* TAG auxiliar do jenkins */
    jMap.JENKINS_TAG = "jenkins/${jMap.BRANCH}-aux"

    /* Verifica se é compilação com baseline */
    jMap.BASELINE = jMap.BUILD_TYPE.find(/^(RELEASE|TESTE_SISTEMICO|RELEASE_CANDIDATE)$/) ? true: false

    // if (jMap.BASELINE) {
    //     if  (!jMap.BUILD_TYPE.equals('TESTE_SISTEMICO') && jMap.CHECKOUT_POINT != 'HEAD'){
    //         error "[ERROR] Não é possivel gerar baselines com a 'Referência para clone do repositório' diferente de 'HEAD'"
    //     }
    // }

    /* Ponto de clone do repositório */
    jMap.POINTER = jMap.BRANCH

    if (jMap.CHECKOUT_POINT != 'HEAD'){
        jMap.POINTER = jMap.CHECKOUT_POINT.equals('LAST') ? jMap.JENKINS_TAG : jMap.CHECKOUT_POINT
    }

    /* Nome de e-mail do usuarios solicitante */
    wrap([$class: 'BuildUser']) {
        try {
            jMap.BUILD_USER = "$BUILD_USER"
            jMap.BUILD_USER_EMAIL = "$BUILD_USER_EMAIL"
        } catch (e){
            /* Foi chamado por outro job (Daily)*/
            jMap.BUILD_USER = "Não informado"
            jMap.BUILD_USER_EMAIL = null
        }
    }

    /* EMAIL : Adiciona equipe de GC a lista de divulgação */
    jMap.EMAIL += ",${jMap.BUILD_USER_EMAIL},gcip@cpqd.com.br"

    return jMap
}

/**
 * Alteração de disponibilidade de contrução do JOB.
 *      - Desabilita / Habilita a construção do JOB. Usado para travar o JOB em caso de falha nos pontos sensiveis (commit)
 */
def setJobDisabled (disable){
    Jenkins.instance.getItemByFullName(JOB_NAME).setDisabled(disable)
}

/**
 * stage Prepare - callPrepare
 *
 * ENTRADA:
 * -------
 *
 * environment
 *    PRODUCT
 *    PROJECT
 *    REPOSITORY
 *
 * jenkins (getProcessedParams)
 *
 * SAIDA:
 * -----
 *   versions   (uBuild.getVersiosInformation)
 *   dockerInfo (uBuild.getDockerInformation)
 *
 * ATENÇÃO:
 *     - Realiza alteração de poms se necessário
 *
 * OBS:
 *     - Alterar versions.poms e versions.files após a chamada de acordo com o produto!!
 */
def callPrepare() {

    /*************************************************************************************
     * Verifica se existe o arquivo sonar-project.properties para obtenção da versão
     *************************************************************************************
     */

    /* Se não existe arquivo sonar-project.properties na raiz verifica se existe pom.xml senão quebra a build */
    def file1Path = "${WORKSPACE}/${repo.DIR}/sonar-project.properties"
    if (!fileExists(file1Path)) {

        buildName "${jenkins.BUILD_DISPLAY_NAME} - Não existe sonar-project.properties"
        error "[ERROR] Não encontrou arquivo sonar-project.properties em ${env.PROJECT}/${env.REPOSITORY}: ${any.getMessage()}"
    }

    /* Obtem informações sobre a versão */
    versions = uBuild.getVersionsInformation(versions, repo, jenkins)
    versions.files = [
	"sonar-project.properties"
    ]

    /* Realiza alterações de versão - necessário quando for Release  */
    if (versions.change) {
        println "[TRACE] 1 changeFilesVersion ${versions.current} por ${versions.preview}"
        uSed.changeFilesVersion (
            directory : repo.DIR,
            oldValue : versions.current,
            newValue : versions.preview,
            listFiles : versions.files
        )
    }
    def url = "https://artifactory.cpqd.com.br/ui/builds/${BUILD_NAME_CUST}/${BUILD_NUMBER_CUST}/"
    String encodeUrl = url.replaceAll(' ','%20')
    println "encodeUrl=${encodeUrl}"

    /* Criação de TAG temporária do Jenkins */
    uGIT.pushTag (directory : repo.DIR, tag : jenkins.JENKINS_TAG)

    /* Definindo POINTER de clone para TAG auxiliar do jenkins */
    jenkins.POINTER = jenkins.JENKINS_TAG

    /* Obtem informações sobre a imagem docker a ser gerada */
    dockerInfo = uBuild.getDockerInformation(dockerInfo, versions, jenkins)
    dockerInfo.rtUrl = encodeUrl

    /* Atualiza informaçoes da compilação na View de construção do Jenkins */
    buildName "${jenkins.BUILD_DISPLAY_NAME} : ${dockerInfo.Target} ${dockerInfo.Tag}"
    buildDescription  "<br>Commit : ${repo.GIT_COMMIT.take(11)}"

    /* Grava e arquiva informaçẽos da construção */
    writeYaml data: jenkins + versions + repo , file: "${jenkins.BUILD_NUMBER}-build-vars.yaml"
    archiveArtifacts "${jenkins.BUILD_NUMBER}-build-vars.yaml"
} // callPrepare

/**
 * stage Artifactory Configuration - callArtifactory
 *
 * ENTRADA:
 * -------
 * Variáveis Jenkins
 *    ARTIFACTORY_SERVER_URL,
 *    ARTIFACTORY_CREDENTIALS
 *
 * Variáveis Jenkinsfile
 *    BUILD_NUMBER_CUST
 *    BUILD_NAME_CUST
 *
 * environment
 *    PRODUCT
 *    PROJECT
 *    REPOSITORY
 *
 * jenkins (getProcessedParams)
 *
 * versions (UBuild.getVersionsInformation)
 *
 * SAIDA:
 * -----
 *   BUILD_NUMBER_CUST
 *   BUILD_NAME_CUST
 *
 */
def configureArtifactory () {

    println "[INFO] CONFIGURANDO ARTIFACTORY..."
    println "${env.PRODUCT}_${env.PROJECT}_${env.REPOSITORY}"

    String branchName = jenkins.BRANCH.replaceAll('/','-')
    String jobName = JOB_NAME.replaceAll('%2F',"-")
    jobName = jobName.replaceAll('/',' :: ')

    if (jenkins.BUILD_TYPE =~ /^(RELEASE|RELEASE_CANDIDATE|REBUILD)$/){
        if (jenkins.BUILD_TYPE == 'RELEASE_CANDIDATE') {
            BUILD_NAME_CUST = "${jobName}_rc"
        } else {
            BUILD_NAME_CUST = "${jobName}_release"
        }
        BUILD_NUMBER_CUST="${versions.publish}"

        if (jenkins.BUILD_TYPE == 'REBUILD') {
            BUILD_NUMBER_CUST="${jenkins.CHECKOUT_POINT} - ${env.PROJECT}"
        } else {
            BUILD_NUMBER_CUST="${versions.publish}"
        }
    } else {
        BUILD_NAME_CUST = "${jobName}"
        BUILD_NUMBER_CUST=env.BUILD_NUMBER
    }

    println "[TRACE] BUILD_NAME_CUST = >${BUILD_NAME_CUST}<"
    println "[TRACE] BUILD_NUMBER_CUST = >${BUILD_NUMBER_CUST}<"


    rtServer ( // Estas variáveis já estão definidas no Jenkins
	id: "ARTIFACTORY_SERVER",
	url: ARTIFACTORY_SERVER_URL,
	credentialsId: ARTIFACTORY_CREDENTIALS
    )
    rtMavenDeployer (
	id: "MAVEN_DEPLOYER",
	serverId: "ARTIFACTORY_SERVER",
	releaseRepo: "cpqd-release",
	snapshotRepo: "cpqd-snapshot",
	threads: 4,
    )
    rtMavenResolver (
	id: "MAVEN_RESOLVER",
	serverId: "ARTIFACTORY_SERVER",
	releaseRepo: "cpqd-group",
	snapshotRepo: "cpqd-group"
    )

} // configureArtifactory

/**
 * stage SonarQube Analysis - callSonar
 *
 * ENTRADA:
 * -------
 *
 * Variáveis Jenkinsfile
 *    BUILD_NUMBER_CUST
 *    BUILD_NAME_CUST
 *
 * environment
 *    PRODUCT
 *    PROJECT
 *    REPOSITORY
 *
 * jenkins (getProcessedParams)
 *
 */
def callSonar() {
    def projectKey="${env.PRODUCT.toLowerCase()}-${env.PROJECT.toLowerCase()}:${env.REPOSITORY}"

    dir ("${repo.DIR}") {
        try {
            withSonarQubeEnv('Sonar') {
                rtMavenRun (
                    pom: "pom.xml",
                    goals: """
                           sonar:sonar
                           -Dsonar.branch.name=${jenkins.BRANCH}
                           -Dsonar.host.url=${SONAR_URL}
                           -Dsonar.login=${SONAR_TOKEN}
                           -Dsonar.projectKey=${projectKey} -Dsonar.projectName=${projectKey}
                    """,
                    // NÃO FAZER DEPLOY PARA O ARTEFACTORY!!
                    // deployerId: "MAVEN_DEPLOYER",
                    resolverId: "MAVEN_RESOLVER",
                    buildName: BUILD_NAME_CUST,
                    buildNumber: BUILD_NUMBER_CUST
                )
            }
            currentBuild.result = "SUCCESS"
            currentBuild.description = "Status: ${currentBuild.currentResult} | Duracao: ${currentBuild.durationString}"
        } catch (Exception err) {
            currentBuild.result = 'FAILURE'
            currentBuild.displayName = "Erro na analise do Sonar"
            currentBuild.description = "Status: ${currentBuild.currentResult} | Duracao: ${currentBuild.durationString} | Erro: ${err}"
            throw err
        }
    }
} // callSonar
