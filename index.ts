/*
 * Vencord Ctrl Mute
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IS_MAC } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelType } from "@vencord/discord-types/enums";
import { ChannelStore, RestAPI, UserGuildSettingsStore, showToast, Toasts } from "@webpack/common";

const CHANNEL_ROW_SELECTOR = '[data-list-item-id^="channels___"]';
const pendingChannels = new Set<string>();

async function toggleMute(channelId: string) {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel?.guild_id || channel.type === ChannelType.GUILD_CATEGORY) return;

    const { guild_id: guildId } = channel;
    const wasMuted = UserGuildSettingsStore.isChannelMuted(guildId, channelId);
    const muted = !wasMuted;
    const pendingKey = `${guildId}:${channelId}`;
    if (pendingChannels.has(pendingKey)) return;

    pendingChannels.add(pendingKey);
    try {
        await RestAPI.patch({
            url: `/users/@me/guilds/${guildId}/settings`,
            body: {
                channel_overrides: {
                    [channelId]: {
                        muted,
                        mute_config: muted
                            ? { selected_time_window: -1, end_time: null }
                            : null
                    }
                }
            }
        });

        showToast(
            muted ? `Muted ${channel.name ?? "channel"} indefinitely` : `Unmuted ${channel.name ?? "channel"}`,
            Toasts.Type.SUCCESS
        );
    } catch (error) {
        console.error("CtrlMute: failed to update channel mute settings", error);
        showToast(`Could not ${muted ? "mute" : "unmute"} ${channel.name ?? "channel"}`, Toasts.Type.FAILURE);
    } finally {
        pendingChannels.delete(pendingKey);
    }
}

function onClick(event: MouseEvent) {
    if (event.button !== 0 || !(event.ctrlKey || (IS_MAC && event.metaKey))) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const row = target.closest(CHANNEL_ROW_SELECTOR);
    if (!row) return;

    const itemId = row.getAttribute("data-list-item-id");
    if (!itemId) return;

    const channelId = itemId.slice("channels___".length);
    const channel = ChannelStore.getChannel(channelId);
    if (!channel?.guild_id || channel.type === ChannelType.GUILD_CATEGORY) return;

    // Keep the modifier-click from also selecting the channel or activating a
    // nested channel-row action.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    void toggleMute(channelId);
}

export default definePlugin({
    name: "CtrlMute",
    description: "Ctrl-click a channel to mute it indefinitely; Ctrl-click again to unmute it",
    authors: [{ name: "x3cca", id: 0n }],
    tags: ["Notifications", "Shortcuts", "Utility"],

    start() {
        document.addEventListener("click", onClick, true);
    },

    stop() {
        document.removeEventListener("click", onClick, true);
        pendingChannels.clear();
    }
});
