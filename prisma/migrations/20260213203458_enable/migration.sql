-- DropForeignKey
ALTER TABLE `avaliacoes` DROP FOREIGN KEY `avaliacoes_ibfk_2`;

-- DropForeignKey
ALTER TABLE `matriculas` DROP FOREIGN KEY `matriculas_ibfk_1`;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`id_aluno`) REFERENCES `alunos`(`id_aluno`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `matriculas` ADD CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos`(`id_aluno`) ON DELETE CASCADE ON UPDATE NO ACTION;
