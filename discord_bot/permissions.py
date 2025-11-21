import discord

from .config import BotConfig


def is_authorized(interaction: discord.Interaction, config: BotConfig) -> bool:
    user = interaction.user
    if user and user.id in config.allowed_user_ids:
        return True

    if isinstance(user, discord.Member):
        role_ids = {role.id for role in user.roles}
        if role_ids.intersection(config.allowed_role_ids):
            return True

    return False


async def require_permission(interaction: discord.Interaction, config: BotConfig) -> bool:
    if is_authorized(interaction, config):
        return True

    response = "You do not have permission to use this command."
    if interaction.response.is_done():
        await interaction.followup.send(response, ephemeral=True)
    else:
        await interaction.response.send_message(response, ephemeral=True)
    return False
