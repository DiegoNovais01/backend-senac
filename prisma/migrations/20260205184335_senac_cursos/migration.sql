-- CreateTable
CREATE TABLE `alunos` (
    `id_aluno` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL,
    `cpf` VARCHAR(14) NULL,
    `email` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `endereco` VARCHAR(255) NULL,
    `data_nascimento` DATE NULL,
    `senha` VARCHAR(255) NULL,
    `data_cadastro` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `unique_cpf_alunos`(`cpf`),
    PRIMARY KEY (`id_aluno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes` (
    `id_avaliacao` INTEGER NOT NULL AUTO_INCREMENT,
    `id_curso` INTEGER NULL,
    `id_aluno` INTEGER NULL,
    `nota` INTEGER NULL,
    `comentario` TEXT NULL,
    `data_avaliacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_aluno`(`id_aluno`),
    INDEX `id_curso`(`id_curso`),
    PRIMARY KEY (`id_avaliacao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cursos` (
    `id_curso` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `data_inicio` DATE NULL,
    `carga_horaria` INTEGER NULL,
    `preco` DECIMAL(10, 2) NULL,
    `nivel` ENUM('básico', 'intermediário', 'avançado') NULL,
    `modalidade` ENUM('presencial', 'online', 'híbrido') NULL,
    `imagem` VARCHAR(255) NULL,
    `status` ENUM('ativo', 'inativo') NULL DEFAULT 'ativo',
    `id_categoria` INTEGER NULL,

    INDEX `id_categoria`(`id_categoria`),
    PRIMARY KEY (`id_curso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrutores` (
    `id_instrutor` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `especialidade` VARCHAR(100) NULL,
    `foto` VARCHAR(255) NULL,
    `cpf` VARCHAR(14) NULL,

    UNIQUE INDEX `unique_cpf_instrutores`(`cpf`),
    PRIMARY KEY (`id_instrutor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matriculas` (
    `id_matricula` INTEGER NOT NULL AUTO_INCREMENT,
    `id_aluno` INTEGER NULL,
    `id_curso` INTEGER NULL,
    `data_matricula` DATE NULL,
    `status` ENUM('ativa', 'concluída', 'cancelada') NULL DEFAULT 'ativa',
    `nota_final` DECIMAL(4, 2) NULL,

    INDEX `id_aluno`(`id_aluno`),
    INDEX `id_curso`(`id_curso`),
    PRIMARY KEY (`id_matricula`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `papel` ENUM('admin', 'professor', 'aluno', 'secretaria') NOT NULL DEFAULT 'aluno',
    `data_cadastro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cpf` VARCHAR(14) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `unique_cpf_usuarios`(`cpf`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos`(`id_curso`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`id_aluno`) REFERENCES `alunos`(`id_aluno`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cursos` ADD CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos`(`id_aluno`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos`(`id_curso`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
