import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export interface Widget {
  id: string;
  type: 'environmental' | 'wind' | 'round-tracker' | 'compass';
  position: Position;
  size: Size;
}

export interface Layout {
  id: string;
  name: string;
  widgets: Widget[];
}

interface DashboardState {
  layouts: Layout[];
  activeLayoutId: string | null;
  addLayout: (name: string) => void;
  removeLayout: (id: string) => void;
  addWidget: (layoutId: string, widget: Omit<Widget, 'id'>) => void;
  updateWidget: (layoutId: string, widgetId: string, updates: Partial<Omit<Widget, 'id'>>) => void;
  removeWidget: (layoutId: string, widgetId: string) => void;
}

export const useDashboard = create<DashboardState>()(
  persist(
    (set: (fn: (state: DashboardState) => Partial<DashboardState>) => void) => ({
      layouts: [],
      activeLayoutId: null,

      addLayout: (name: string) => set((state: DashboardState) => {
        const newLayout: Layout = {
          id: nanoid(),
          name,
          widgets: [],
        };
        return {
          layouts: [...state.layouts, newLayout],
          activeLayoutId: state.activeLayoutId || newLayout.id,
        };
      }),

      removeLayout: (id: string) => set((state: DashboardState) => ({
        layouts: state.layouts.filter((layout: Layout) => layout.id !== id),
        activeLayoutId: state.activeLayoutId === id
          ? state.layouts[0]?.id || null
          : state.activeLayoutId,
      })),

      addWidget: (layoutId: string, widget: Omit<Widget, 'id'>) => set((state: DashboardState) => ({
        layouts: state.layouts.map((layout: Layout) =>
          layout.id === layoutId
            ? {
                ...layout,
                widgets: [
                  ...layout.widgets,
                  { ...widget, id: nanoid() },
                ],
              }
            : layout
        ),
      })),

      updateWidget: (layoutId: string, widgetId: string, updates: Partial<Omit<Widget, 'id'>>) => 
        set((state: DashboardState) => ({
          layouts: state.layouts.map((layout: Layout) =>
            layout.id === layoutId
              ? {
                  ...layout,
                  widgets: layout.widgets.map((widget: Widget) =>
                  widget.id === widgetId
                    ? { ...widget, ...updates }
                    : widget
                ),
              }
            : layout
        ),
      })),

      removeWidget: (layoutId: string, widgetId: string) => set((state: DashboardState) => ({
        layouts: state.layouts.map((layout: Layout) =>
          layout.id === layoutId
            ? {
                ...layout,
                widgets: layout.widgets.filter((w: Widget) => w.id !== widgetId),
              }
            : layout
        ),
      })),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize default layout if none exists
useDashboard.getState().layouts.length === 0 && useDashboard.getState().addLayout('Default');
