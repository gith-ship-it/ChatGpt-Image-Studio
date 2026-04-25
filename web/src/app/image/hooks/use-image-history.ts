"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  clearImageConversations,
  deleteImageConversation,
  getCachedImageConversationsSnapshot,
  listImageConversations,
  type ImageConversation,
} from "@/store/image-conversations";
import { listActiveImageTasks } from "@/store/image-active-tasks";

type UseImageHistoryOptions = {
  normalizeHistory: (items: ImageConversation[]) => Promise<ImageConversation[]>;
  mountedRef: React.RefObject<boolean>;
  draftSelectionRef: React.RefObject<boolean>;
  syncRuntimeTaskState: (preferredConversationId?: string | null) => void;
};

export function useImageHistory({
  normalizeHistory,
  mountedRef,
  draftSelectionRef,
  syncRuntimeTaskState,
}: UseImageHistoryOptions) {
  const cachedConversations = getCachedImageConversationsSnapshot();
  const [conversations, setConversations] = useState<ImageConversation[]>(cachedConversations ?? []);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(cachedConversations?.[0]?.id ?? null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(!cachedConversations);

  const focusConversation = useCallback((conversationId: string) => {
    draftSelectionRef.current = false;
    setSelectedConversationId(conversationId);
  }, [draftSelectionRef]);

  const openDraftConversation = useCallback(() => {
    draftSelectionRef.current = true;
    setSelectedConversationId(null);
  }, [draftSelectionRef]);

  const hasActiveTask = useCallback((conversationId?: string) => {
    const tasks = listActiveImageTasks();
    if (!conversationId) {
      return tasks.length > 0;
    }
    return tasks.some((task) => task.conversationId === conversationId);
  }, []);

  const refreshHistory = useCallback(async (options: { normalize?: boolean; silent?: boolean; withLoading?: boolean } = {}) => {
    const { normalize = false, silent = false, withLoading = false } = options;

    try {
      if (withLoading && mountedRef.current && !getCachedImageConversationsSnapshot()) {
        setIsLoadingHistory(true);
      }
      const items = await listImageConversations();
      const nextItems = normalize ? await normalizeHistory(items) : items;
      if (!mountedRef.current) {
        return;
      }
      setConversations(nextItems);
      setSelectedConversationId((current) => {
        if (current && nextItems.some((item) => item.id === current)) {
          return current;
        }
        if (draftSelectionRef.current) {
          return null;
        }
        const activeTaskConversationId = listActiveImageTasks()[0]?.conversationId ?? null;
        if (activeTaskConversationId && nextItems.some((item) => item.id === activeTaskConversationId)) {
          return activeTaskConversationId;
        }
        return nextItems[0]?.id ?? null;
      });
      const activeTaskConversationId = listActiveImageTasks()[0]?.conversationId ?? null;
      const preferredConversationId =
        activeTaskConversationId && nextItems.some((item) => item.id === activeTaskConversationId)
          ? activeTaskConversationId
          : nextItems[0]?.id ?? null;
      syncRuntimeTaskState(preferredConversationId);
    } catch (error) {
      if (!silent && mountedRef.current) {
        const message = error instanceof Error ? error.message : "加载会话失败";
        toast.error(message);
      }
    } finally {
      if (withLoading && mountedRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }, [draftSelectionRef, mountedRef, normalizeHistory, syncRuntimeTaskState]);

  const handleCreateDraft = useCallback((resetComposer: (nextMode?: "generate" | "edit" | "upscale") => void, textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    openDraftConversation();
    resetComposer("generate");
    textareaRef.current?.focus();
  }, [openDraftConversation]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    if (hasActiveTask(id)) {
      toast.error("当前会话仍在处理中，请等待任务完成后再删除");
      return;
    }

    const previousSelectedId = selectedConversationId;
    const previousDraftSelection = draftSelectionRef.current;

    setConversations((current) => {
      const nextConversations = current.filter((item) => item.id !== id);
      setSelectedConversationId((prev) => {
        if (prev !== id) {
          return prev;
        }
        draftSelectionRef.current = false;
        return nextConversations[0]?.id ?? null;
      });
      return nextConversations;
    });

    try {
      await deleteImageConversation(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除会话失败";
      toast.error(message);
      const items = await listImageConversations();
      if (!mountedRef.current) {
        return;
      }
      draftSelectionRef.current = previousDraftSelection;
      setConversations(items);
      setSelectedConversationId(() => {
        if (previousSelectedId && items.some((item) => item.id === previousSelectedId)) {
          return previousSelectedId;
        }
        if (previousDraftSelection) {
          return null;
        }
        return items[0]?.id ?? null;
      });
    }
  }, [draftSelectionRef, hasActiveTask, mountedRef, selectedConversationId]);

  const handleClearHistory = useCallback(async () => {
    if (hasActiveTask()) {
      toast.error("仍有图片任务在处理中，暂时不能清空历史记录");
      return;
    }

    try {
      await clearImageConversations();
      draftSelectionRef.current = true;
      setConversations([]);
      setSelectedConversationId(null);
      toast.success("已清空历史记录");
    } catch (error) {
      const message = error instanceof Error ? error.message : "清空历史记录失败";
      toast.error(message);
    }
  }, [draftSelectionRef, hasActiveTask]);

  return {
    conversations,
    selectedConversationId,
    isLoadingHistory,
    setConversations,
    setSelectedConversationId,
    setIsLoadingHistory,
    focusConversation,
    openDraftConversation,
    refreshHistory,
    handleCreateDraft,
    handleDeleteConversation,
    handleClearHistory,
  };
}
