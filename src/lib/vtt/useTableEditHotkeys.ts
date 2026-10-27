'use client';

import { useEffect, type MutableRefObject } from 'react';
import type { BoardNavTool } from '../../components/vtt/BoardNavToolbar';
import type { ViewMode } from '../../components/vtt/NightCityBar';
import { isTypingTarget } from './keyboardTarget';

export type ToolMode = 'select' | 'fog' | 'wall' | 'pan';

export type TableEditHotkeysArgs = {
  isGm: boolean;
  combatMyTurn: boolean;
  intent: (kind: string, payload?: Record<string, unknown>) => void;
  setViewModeShortcut: (m: ViewMode) => void;
  setSafeVision: (fn: (v: boolean) => boolean) => void;
  myTokenIds: string[];
  hasOptics: boolean;
  hasNetDeck: boolean;
  activateKiroshi: (opts?: { bypass?: boolean }) => void;
  toggleBothHuds: () => void;
  spawnPlacement: unknown | null;
  setSpawnPlacement: (v: null) => void;
  deleteSelectedGm: () => void;
  clearEditState: () => void;
  setBoardNavTool: (t: BoardNavTool) => void;
  setTool: (t: ToolMode) => void;
  tool: ToolMode;
  toggleGmShortcutsLegend: () => void;
  onGmToolHotkey?: (key: 'fog' | 'wall' | 'grid' | 'lock') => void;
  selectedTokenId: string | null;
  stateTokens:
    | Array<{ id: string; x: number; y: number; floor?: number }>
    | undefined;
  aimMode: boolean;
  currentFloor: number;
  mapW: number;
  mapH: number;
  canDragToken: (t: { id: string }) => boolean;
  moveSelectedToken?: (dx: number, dy: number) => void;
  onResetMovement?: () => void;
  onHistoryUndo?: () => void;
  onHistoryRedo?: () => void;
  spaceHeldRef: MutableRefObject<boolean>;
  spacePanUsedRef: MutableRefObject<boolean>;
  setSpaceHeld: (v: boolean) => void;
};

export function useTableEditHotkeys({
  isGm,
  combatMyTurn,
  intent,
  setViewModeShortcut,
  setSafeVision,
  myTokenIds,
  hasOptics,
  hasNetDeck,
  activateKiroshi,
  toggleBothHuds,
  spawnPlacement,
  setSpawnPlacement,
  deleteSelectedGm,
  clearEditState,
  setBoardNavTool,
  setTool,
  tool,
  toggleGmShortcutsLegend,
  onGmToolHotkey,
  selectedTokenId,
  stateTokens,
  aimMode,
  currentFloor,
  mapW,
  mapH,
  canDragToken,
  moveSelectedToken,
  onResetMovement,
  onHistoryUndo,
  onHistoryRedo,
  spaceHeldRef,
  spacePanUsedRef,
  setSpaceHeld,
}: TableEditHotkeysArgs) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e)) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        toggleBothHuds();
        return;
      }

      if (e.key === 'Escape') {
        if (spawnPlacement) {
          setSpawnPlacement(null);
          return;
        }
        clearEditState();
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        if (isGm) {
          e.preventDefault();
          toggleGmShortcutsLegend();
        }
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (e.type === 'keydown' && !e.repeat) {
          e.preventDefault();
          spaceHeldRef.current = true;
          spacePanUsedRef.current = false;
          setSpaceHeld(true);
        }
        return;
      }

      if (e.key === 'v' || e.key === 'V') {
        setBoardNavTool('select');
        if (isGm && tool !== 'fog' && tool !== 'wall') {
          setTool('select');
        }
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setBoardNavTool('hand');
        return;
      }

      if (
        isGm &&
        onGmToolHotkey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const lk = e.key.toLowerCase();
        if (lk === 'b') {
          e.preventDefault();
          onGmToolHotkey('fog');
          return;
        }
        if (lk === 'w') {
          e.preventDefault();
          onGmToolHotkey('wall');
          return;
        }
        if (lk === 'g') {
          e.preventDefault();
          onGmToolHotkey('grid');
          return;
        }
        if (lk === 'l') {
          e.preventDefault();
          onGmToolHotkey('lock');
          return;
        }
      }

      if (
        isGm &&
        (e.key === 'Delete' || e.key === 'Backspace')
      ) {
        e.preventDefault();
        deleteSelectedGm();
        return;
      }

      if (isGm && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) onHistoryRedo?.();
        else onHistoryUndo?.();
        return;
      }

      if (e.key === '1') {
        setViewModeShortcut('normal');
        return;
      }
      if (e.key === '2') {
        if (isGm || (myTokenIds.length > 0 && hasOptics)) {
          activateKiroshi(isGm ? { bypass: true } : undefined);
        }
        return;
      }
      if (e.key === '3') {
        if (isGm || (myTokenIds.length > 0 && hasNetDeck)) {
          setViewModeShortcut('net');
        }
        return;
      }
      if (e.key === '4') {
        if (isGm || myTokenIds.length > 0) {
          setSafeVision((v) => !v);
        }
        return;
      }

      let dx = 0;
      let dy = 0;
      switch (e.key) {
        case 'ArrowUp':
          dy = -1;
          break;
        case 'ArrowDown':
          dy = 1;
          break;
        case 'ArrowLeft':
          dx = -1;
          break;
        case 'ArrowRight':
          dx = 1;
          break;
        default: {
          const lk = e.key.toLowerCase();
          if (lk === 'w') dy = -1;
          else if (lk === 's') dy = 1;
          else if (lk === 'a') dx = -1;
          else if (lk === 'd') dx = 1;
          else return;
        }
      }
      if (e.key.toLowerCase() === 'r' && onResetMovement) {
        e.preventDefault();
        onResetMovement();
        return;
      }

      if (!selectedTokenId) return;
      const nudgeTok = stateTokens?.find((t) => t.id === selectedTokenId);
      if (!nudgeTok || !canDragToken(nudgeTok)) return;
      if (tool !== 'select' || aimMode || spawnPlacement) return;
      if ((nudgeTok.floor ?? 0) !== currentFloor) return;
      e.preventDefault();
      if (moveSelectedToken) {
        moveSelectedToken(dx, dy);
        return;
      }
      const nx = Math.max(0, Math.min(mapW - 1, nudgeTok.x + dx));
      const ny = Math.max(0, Math.min(mapH - 1, nudgeTok.y + dy));
      if (nx === nudgeTok.x && ny === nudgeTok.y) return;
      intent('token:move', { tokenId: nudgeTok.id, x: nx, y: ny });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.code !== 'Space') return;
      e.preventDefault();
      spaceHeldRef.current = false;
      setSpaceHeld(false);
      if (!spacePanUsedRef.current) {
        if (isGm || combatMyTurn) intent('initiative:next', {});
      }
      spacePanUsedRef.current = false;
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    isGm,
    combatMyTurn,
    intent,
    setViewModeShortcut,
    setSafeVision,
    myTokenIds,
    hasOptics,
    hasNetDeck,
    activateKiroshi,
    toggleBothHuds,
    spawnPlacement,
    setSpawnPlacement,
    deleteSelectedGm,
    clearEditState,
    setBoardNavTool,
    setTool,
    tool,
    toggleGmShortcutsLegend,
    onGmToolHotkey,
    selectedTokenId,
    stateTokens,
    aimMode,
    currentFloor,
    mapW,
    mapH,
    canDragToken,
    moveSelectedToken,
    onResetMovement,
    spaceHeldRef,
    spacePanUsedRef,
    setSpaceHeld,
  ]);
}
