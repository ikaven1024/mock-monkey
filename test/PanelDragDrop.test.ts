/**
 * Panel drag & drop reordering unit tests
 * Tests for the drag & drop functionality in Panel.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Panel } from '../src/ui/Panel';
import { I18n } from '../src/i18n';
import type { RuleItem } from '../src/ui/Panel';
import type { MockMethod } from '../src/types';

// Access private methods for testing
type PanelWithPrivateAccess = {
  bindRuleDragEvents: (listContainer: Element) => Element;
  bindMethodDragEvents: (listContainer: Element) => Element;
  onReorderRules: (ids: string[]) => void;
  onReorderMethods: (ids: string[]) => void;
};

// Create mock HTML element with drag handle
function createDraggableRuleItem(id: string, pattern: string): HTMLElement {
  const item = document.createElement('div');
  item.className = 'mm-rule-item';
  item.draggable = true;
  item.dataset.ruleId = id;

  const handle = document.createElement('span');
  handle.className = 'mm-drag-handle';
  handle.textContent = '⋮⋮';
  item.appendChild(handle);

  const content = document.createElement('span');
  content.textContent = pattern;
  item.appendChild(content);

  return item;
}

// Create mock HTML element for method
function createDraggableMethodItem(id: string, name: string): HTMLElement {
  const item = document.createElement('div');
  item.className = 'mm-method-item';
  item.draggable = true;
  item.dataset.methodId = id;

  const handle = document.createElement('span');
  handle.className = 'mm-drag-handle';
  handle.textContent = '⋮⋮';
  item.appendChild(handle);

  const content = document.createElement('span');
  content.textContent = name;
  item.appendChild(content);

  return item;
}

// Helper to simulate drag events
function simulateDrag(
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  container: HTMLElement,
  dragHandleClicked: boolean = true
): void {
  // Simulate mousedown on drag handle
  if (dragHandleClicked) {
    const handle = sourceElement.querySelector('.mm-drag-handle');
    if (handle) {
      const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
      handle.dispatchEvent(mousedownEvent);
    }
  } else {
    // Click elsewhere
    const mousedownEvent = new MouseEvent('mousedown', { bubbles: true });
    sourceElement.dispatchEvent(mousedownEvent);
  }

  // Simulate dragstart
  const dragStartEvent = new DragEvent('dragstart', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });
  sourceElement.dispatchEvent(dragStartEvent);

  // Check if drag was prevented
  if (dragStartEvent.defaultPrevented && !dragHandleClicked) {
    return; // Drag was prevented as expected
  }

  // Simulate dragenter on target
  const dragEnterEvent = new DragEvent('dragenter', { bubbles: true, cancelable: true });
  targetElement.dispatchEvent(dragEnterEvent);

  // Simulate dragover on target
  const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
  targetElement.dispatchEvent(dragOverEvent);

  // Simulate drop
  const dropEvent = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: new DataTransfer()
  });
  targetElement.dispatchEvent(dropEvent);

  // Simulate dragend
  const dragEndEvent = new DragEvent('dragend', { bubbles: true });
  sourceElement.dispatchEvent(dragEndEvent);
}

describe('Panel Rule Drag & Drop', () => {
  let panel: Panel & PanelWithPrivateAccess;
  let container: HTMLElement;
  let onReorderRulesSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onReorderRulesSpy = vi.fn();

    // Create Panel instance with reorder callback
    panel = new Panel(
      () => {},
      () => {},
      () => {},
      {
        onReorderRules: onReorderRulesSpy,
      }
    ) as Panel & PanelWithPrivateAccess;

    // Set up reorder function
    panel.onReorderRules = onReorderRulesSpy;

    // Create container with mock rule items
    container = document.createElement('div');
    container.appendChild(createDraggableRuleItem('rule1', '/api/one'));
    container.appendChild(createDraggableRuleItem('rule2', '/api/two'));
    container.appendChild(createDraggableRuleItem('rule3', '/api/three'));
  });

  describe('drag handle requirement', () => {
    it('should prevent drag when not clicking the drag handle', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const firstItem = boundContainer.querySelector('.mm-rule-item') as HTMLElement;

      // Simulate drag without clicking handle
      simulateDrag(firstItem, firstItem, boundContainer, false);

      // Verify drag was prevented (item should not have dragging class)
      expect(firstItem.classList.contains('mm-rule-item--dragging')).toBe(false);
    });

    it('should allow drag when clicking the drag handle', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Simulate drag with handle clicked
      simulateDrag(items[0], items[1], boundContainer, true);

      // Verify drag was allowed (item had dragging class, now removed after dragend)
      expect(items[0].classList.contains('mm-rule-item--dragging')).toBe(false);
      expect(items[1].classList.contains('mm-rule-item--drag-over')).toBe(false);
    });
  });

  describe('DOM order change', () => {
    it('should reorder DOM elements after drag & drop (move down)', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Initial order
      expect(items[0].dataset.ruleId).toBe('rule1');
      expect(items[1].dataset.ruleId).toBe('rule2');
      expect(items[2].dataset.ruleId).toBe('rule3');

      // Drag rule1 to rule2's position (move down)
      simulateDrag(items[0], items[1], boundContainer, true);

      // Check new order
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];
      expect(newItems[0].dataset.ruleId).toBe('rule2');
      expect(newItems[1].dataset.ruleId).toBe('rule1');
      expect(newItems[2].dataset.ruleId).toBe('rule3');
    });

    it('should reorder DOM elements after drag & drop (move up)', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Initial order
      expect(items[0].dataset.ruleId).toBe('rule1');
      expect(items[1].dataset.ruleId).toBe('rule2');
      expect(items[2].dataset.ruleId).toBe('rule3');

      // Drag rule3 to rule1's position (move up)
      simulateDrag(items[2], items[0], boundContainer, true);

      // Check new order
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];
      expect(newItems[0].dataset.ruleId).toBe('rule3');
      expect(newItems[1].dataset.ruleId).toBe('rule1');
      expect(newItems[2].dataset.ruleId).toBe('rule2');
    });

    it('should not change order when dropping on itself', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Try to drag item onto itself
      simulateDrag(items[1], items[1], boundContainer, true);

      // Order should remain the same
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];
      expect(newItems[0].dataset.ruleId).toBe('rule1');
      expect(newItems[1].dataset.ruleId).toBe('rule2');
      expect(newItems[2].dataset.ruleId).toBe('rule3');
    });
  });

  describe('callback invocation', () => {
    it('should call onReorderRules with correct ID array after reorder', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Drag rule1 to rule2's position
      simulateDrag(items[0], items[1], boundContainer, true);

      // Verify callback was called with new order
      expect(onReorderRulesSpy).toHaveBeenCalledTimes(1);
      expect(onReorderRulesSpy).toHaveBeenCalledWith(['rule2', 'rule1', 'rule3']);
    });

    it('should call onReorderRules with new order after multiple reorders', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      let items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // First reorder: move rule1 to position 2
      simulateDrag(items[0], items[1], boundContainer, true);
      expect(onReorderRulesSpy).toHaveBeenCalledWith(['rule2', 'rule1', 'rule3']);

      // Get updated items
      items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Second reorder: move rule3 to position 0
      simulateDrag(items[2], items[0], boundContainer, true);
      expect(onReorderRulesSpy).toHaveBeenCalledWith(['rule3', 'rule2', 'rule1']);
    });

    it('should pass all rule IDs in current DOM order', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Move last item to first position
      simulateDrag(items[2], items[0], boundContainer, true);

      const callArgs = onReorderRulesSpy.mock.calls[0][0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs).toEqual(['rule3', 'rule1', 'rule2']);
    });
  });

  describe('drag state management', () => {
    it('should add and remove dragging class during drag operation', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];
      const firstItem = items[0];

      // Simulate mousedown on handle
      const handle = firstItem.querySelector('.mm-drag-handle');
      if (handle) {
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }

      // Trigger dragstart
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });
      firstItem.dispatchEvent(dragStartEvent);

      // Verify dragging class was added
      expect(firstItem.classList.contains('mm-rule-item--dragging')).toBe(true);

      // Trigger dragend
      const dragEndEvent = new DragEvent('dragend', { bubbles: true });
      firstItem.dispatchEvent(dragEndEvent);

      // Verify dragging class was removed
      expect(firstItem.classList.contains('mm-rule-item--dragging')).toBe(false);
    });

    it('should add and remove drag-over class on target item', () => {
      const boundContainer = panel.bindRuleDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-rule-item')) as HTMLElement[];

      // Set up drag
      const handle = items[0].querySelector('.mm-drag-handle');
      if (handle) {
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }

      items[0].dispatchEvent(new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      }));

      // Trigger dragover on second item
      items[1].dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));

      // Verify drag-over class was added
      expect(items[1].classList.contains('mm-rule-item--drag-over')).toBe(true);

      // Trigger dragend
      items[0].dispatchEvent(new DragEvent('dragend', { bubbles: true }));

      // Verify drag-over class was removed
      expect(items[1].classList.contains('mm-rule-item--drag-over')).toBe(false);
    });
  });
});

describe('Panel Method Drag & Drop', () => {
  let panel: Panel & PanelWithPrivateAccess;
  let container: HTMLElement;
  let onReorderMethodsSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onReorderMethodsSpy = vi.fn();

    // Create Panel instance with reorder callback
    panel = new Panel(
      () => {},
      () => {},
      () => {},
      {
        onReorderMethods: onReorderMethodsSpy,
      }
    ) as Panel & PanelWithPrivateAccess;

    // Set up reorder function
    panel.onReorderMethods = onReorderMethodsSpy;

    // Create container with mock method items
    container = document.createElement('div');
    container.appendChild(createDraggableMethodItem('method1', 'getUser'));
    container.appendChild(createDraggableMethodItem('method2', 'createUser'));
    container.appendChild(createDraggableMethodItem('method3', 'deleteUser'));
  });

  describe('drag handle requirement', () => {
    it('should prevent drag when not clicking the drag handle', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const firstItem = boundContainer.querySelector('.mm-method-item') as HTMLElement;

      // Simulate drag without clicking handle
      simulateDrag(firstItem, firstItem, boundContainer, false);

      // Verify drag was prevented
      expect(firstItem.classList.contains('mm-method-item--dragging')).toBe(false);
    });

    it('should allow drag when clicking the drag handle', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Simulate drag with handle clicked
      simulateDrag(items[0], items[1], boundContainer, true);

      // Verify drag was allowed
      expect(items[0].classList.contains('mm-method-item--dragging')).toBe(false);
      expect(items[1].classList.contains('mm-method-item--drag-over')).toBe(false);
    });
  });

  describe('DOM order change', () => {
    it('should reorder DOM elements after drag & drop (move down)', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Initial order
      expect(items[0].dataset.methodId).toBe('method1');
      expect(items[1].dataset.methodId).toBe('method2');
      expect(items[2].dataset.methodId).toBe('method3');

      // Drag method1 to method2's position (move down)
      simulateDrag(items[0], items[1], boundContainer, true);

      // Check new order
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];
      expect(newItems[0].dataset.methodId).toBe('method2');
      expect(newItems[1].dataset.methodId).toBe('method1');
      expect(newItems[2].dataset.methodId).toBe('method3');
    });

    it('should reorder DOM elements after drag & drop (move up)', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Initial order
      expect(items[0].dataset.methodId).toBe('method1');
      expect(items[1].dataset.methodId).toBe('method2');
      expect(items[2].dataset.methodId).toBe('method3');

      // Drag method3 to method1's position (move up)
      simulateDrag(items[2], items[0], boundContainer, true);

      // Check new order
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];
      expect(newItems[0].dataset.methodId).toBe('method3');
      expect(newItems[1].dataset.methodId).toBe('method1');
      expect(newItems[2].dataset.methodId).toBe('method2');
    });

    it('should not change order when dropping on itself', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Try to drag item onto itself
      simulateDrag(items[1], items[1], boundContainer, true);

      // Order should remain the same
      const newItems = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];
      expect(newItems[0].dataset.methodId).toBe('method1');
      expect(newItems[1].dataset.methodId).toBe('method2');
      expect(newItems[2].dataset.methodId).toBe('method3');
    });
  });

  describe('callback invocation', () => {
    it('should call onReorderMethods with correct ID array after reorder', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Drag method1 to method2's position
      simulateDrag(items[0], items[1], boundContainer, true);

      // Verify callback was called with new order
      expect(onReorderMethodsSpy).toHaveBeenCalledTimes(1);
      expect(onReorderMethodsSpy).toHaveBeenCalledWith(['method2', 'method1', 'method3']);
    });

    it('should call onReorderMethods with new order after multiple reorders', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      let items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // First reorder: move method1 to position 2
      simulateDrag(items[0], items[1], boundContainer, true);
      expect(onReorderMethodsSpy).toHaveBeenCalledWith(['method2', 'method1', 'method3']);

      // Get updated items
      items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Second reorder: move method3 to position 0
      simulateDrag(items[2], items[0], boundContainer, true);
      expect(onReorderMethodsSpy).toHaveBeenCalledWith(['method3', 'method2', 'method1']);
    });

    it('should pass all method IDs in current DOM order', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Move last item to first position
      simulateDrag(items[2], items[0], boundContainer, true);

      const callArgs = onReorderMethodsSpy.mock.calls[0][0];
      expect(callArgs).toHaveLength(3);
      expect(callArgs).toEqual(['method3', 'method1', 'method2']);
    });
  });

  describe('drag state management', () => {
    it('should add and remove dragging class during drag operation', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];
      const firstItem = items[0];

      // Simulate mousedown on handle
      const handle = firstItem.querySelector('.mm-drag-handle');
      if (handle) {
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }

      // Trigger dragstart
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });
      firstItem.dispatchEvent(dragStartEvent);

      // Verify dragging class was added
      expect(firstItem.classList.contains('mm-method-item--dragging')).toBe(true);

      // Trigger dragend
      const dragEndEvent = new DragEvent('dragend', { bubbles: true });
      firstItem.dispatchEvent(dragEndEvent);

      // Verify dragging class was removed
      expect(firstItem.classList.contains('mm-method-item--dragging')).toBe(false);
    });

    it('should add and remove drag-over class on target item', () => {
      const boundContainer = panel.bindMethodDragEvents(container) as HTMLElement;
      const items = Array.from(boundContainer.querySelectorAll('.mm-method-item')) as HTMLElement[];

      // Set up drag
      const handle = items[0].querySelector('.mm-drag-handle');
      if (handle) {
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      }

      items[0].dispatchEvent(new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      }));

      // Trigger dragover on second item
      items[1].dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));

      // Verify drag-over class was added
      expect(items[1].classList.contains('mm-method-item--drag-over')).toBe(true);

      // Trigger dragend
      items[0].dispatchEvent(new DragEvent('dragend', { bubbles: true }));

      // Verify drag-over class was removed
      expect(items[1].classList.contains('mm-method-item--drag-over')).toBe(false);
    });
  });
});
