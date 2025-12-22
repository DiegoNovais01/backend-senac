import prisma from "../db.js";

/**
 * Limpa refresh tokens expirados e tokens revogados antigos.
 * - Remove tokens com expires_at <= now() (expirados)
 * - Remove tokens revogados há mais de 30 dias (opcional)
 */
export async function cleanupRefreshTokens({ olderThanDays = 30 } = {}) {
  try {
    const now = new Date();

    // Deleta tokens expirados
    const expired = await prisma.refresh_tokens.deleteMany({
      where: { expires_at: { lte: now } }
    });

    // Deleta tokens revogados há mais de `olderThanDays`
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const revokedOld = await prisma.refresh_tokens.deleteMany({
      where: {
        revoked: true,
        created_at: { lte: cutoff }
      }
    });

    console.log(`🧹 Cleanup tokens: expirados=${expired.count}, revogadosAntigos=${revokedOld.count}`);
  } catch (err) {
    console.error('Erro no cleanupRefreshTokens:', err);
  }
}

export default cleanupRefreshTokens;
