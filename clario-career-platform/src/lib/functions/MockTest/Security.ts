import { ProctorEvent } from '@/app/api/ai/mocktest/security/route';


export async function logProctorEvent(
  type: ProctorEvent['type'],
  sessionId: string,
  userEmail?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await fetch('/api/ai/mocktest/security/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        timestamp: Date.now(),
        sessionId,
        userEmail,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to log proctor event:', error);
  }
}


export class ScreenshotDetector {
  private sessionId: string;
  private userEmail?: string;
  private onDetected?: () => void;

  constructor(sessionId: string, userEmail?: string, onDetected?: () => void) {
    this.sessionId = sessionId;
    this.userEmail = userEmail;
    this.onDetected = onDetected;
  }

  start() {
    // Detect PrintScreen key
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Detect common screenshot shortcuts
    window.addEventListener('blur', this.handleBlur);
  }

  stop() {
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    // PrintScreen key
    if (e.key === 'PrintScreen') {
      this.triggerScreenshotDetection('PrintScreen key');
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Windows: Win + Shift + S (Snipping Tool)
    if (e.key === 's' && e.shiftKey && e.metaKey) {
      e.preventDefault();
      this.triggerScreenshotDetection('Windows Snipping Tool');
    }
    
    // Mac: Cmd + Shift + 3/4/5
    if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      this.triggerScreenshotDetection('Mac screenshot shortcut');
    }
    
    // Ctrl + S (save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.triggerScreenshotDetection('Ctrl+S detected');
    }
  };

  private handleBlur = () => {
    // Window lost focus - possible screenshot tool activation
    setTimeout(() => {
      if (!document.hasFocus()) {
        this.triggerScreenshotDetection('Window blur - possible screenshot tool');
      }
    }, 100);
  };

  private triggerScreenshotDetection(method: string) {
    logProctorEvent('screenshot', this.sessionId, this.userEmail, { method });
    
    // Flash dark overlay
    this.flashOverlay();
    
    // Trigger callback
    if (this.onDetected) {
      this.onDetected();
    }
  }

  private flashOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      pointer-events: none;
      animation: flash 0.3s ease-out;
    `;
    
    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes flash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    }, 300);
  }
}

/**
 * Clipboard monitoring and clearing
 */
export class ClipboardMonitor {
  private sessionId: string;
  private userEmail?: string;
  private intervalId?: NodeJS.Timeout;
  private lastClipboardContent: string = '';

  constructor(sessionId: string, userEmail?: string) {
    this.sessionId = sessionId;
    this.userEmail = userEmail;
  }

  start() {
    // Monitor copy events
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('cut', this.handleCut);
    
    // Periodically clear clipboard (best-effort)
    this.intervalId = setInterval(() => {
      this.clearClipboard();
    }, 5000); // Every 5 seconds
  }

  stop() {
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('cut', this.handleCut);
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private handleCopy = (e: ClipboardEvent) => {
    e.preventDefault();
    logProctorEvent('copy', this.sessionId, this.userEmail);
  };

  private handleCut = (e: ClipboardEvent) => {
    e.preventDefault();
    logProctorEvent('copy', this.sessionId, this.userEmail, { type: 'cut' });
  };

  private async clearClipboard() {
    try {
      // Check if Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Read current clipboard
        const text = await navigator.clipboard.readText();
        
        // If clipboard has content and it's different from last check
        if (text && text !== this.lastClipboardContent) {
          logProctorEvent('clipboard_clear', this.sessionId, this.userEmail, {
            contentLength: text.length,
          });
        }
        
        // Clear clipboard
        await navigator.clipboard.writeText('');
        this.lastClipboardContent = '';
      }
    } catch (error) {
      // Clipboard access denied - this is expected in many browsers
      // Silently fail as this is best-effort
    }
  }
}

/**
 * Mouse movement tracking
 */
export class MouseTracker {
  private sessionId: string;
  private userEmail?: string;
  private lastMouseMove: number = Date.now();
  private inactivityThreshold: number = 30000; // 30 seconds
  private edgeCampingThreshold: number = 5000; // 5 seconds
  private edgeCampingStart: number | null = null;
  private checkInterval?: NodeJS.Timeout;
  private isMouseOutside: boolean = false;

  constructor(sessionId: string, userEmail?: string) {
    this.sessionId = sessionId;
    this.userEmail = userEmail;
  }

  start() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseenter', this.handleMouseEnter);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Check for inactivity
    this.checkInterval = setInterval(() => {
      this.checkInactivity();
      this.checkEdgeCamping();
    }, 1000);
  }

  stop() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseenter', this.handleMouseEnter);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.lastMouseMove = Date.now();
    
    // Check if mouse is near edges (within 50px)
    const isNearEdge = 
      e.clientX < 50 || 
      e.clientY < 50 || 
      e.clientX > window.innerWidth - 50 || 
      e.clientY > window.innerHeight - 50;
    
    if (isNearEdge) {
      if (!this.edgeCampingStart) {
        this.edgeCampingStart = Date.now();
      }
    } else {
      this.edgeCampingStart = null;
    }
  };

  private handleMouseEnter = () => {
    this.isMouseOutside = false;
  };

  private handleMouseLeave = () => {
    this.isMouseOutside = true;
    logProctorEvent('mouse_edge', this.sessionId, this.userEmail, {
      event: 'mouse_left_viewport',
    });
  };

  private checkInactivity() {
    const inactiveDuration = Date.now() - this.lastMouseMove;
    
    if (inactiveDuration > this.inactivityThreshold) {
      logProctorEvent('mouse_inactive', this.sessionId, this.userEmail, {
        inactiveDuration: Math.floor(inactiveDuration / 1000),
      });
      
      // Reset to prevent spam
      this.lastMouseMove = Date.now();
    }
  }

  private checkEdgeCamping() {
    if (this.edgeCampingStart) {
      const campingDuration = Date.now() - this.edgeCampingStart;
      
      if (campingDuration > this.edgeCampingThreshold) {
        logProctorEvent('mouse_edge', this.sessionId, this.userEmail, {
          event: 'edge_camping',
          duration: Math.floor(campingDuration / 1000),
        });
        
        // Reset to prevent spam
        this.edgeCampingStart = Date.now();
      }
    }
  }
}

/**
 * Safe Exam Browser detection
 */
export class SEBDetector {
  static detect(): boolean {
    // Check for SEB user agent
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('seb') || userAgent.includes('safeexambrowser')) {
      return true;
    }
    
    // Check for SEB-specific window properties
    if ((window as any).SafeExamBrowser) {
      return true;
    }
    
    // Check for SEB API
    if ((window as any).SEB) {
      return true;
    }
    
    return false;
  }

  static getConfigKey(): string | null {
    // Try to get SEB config key if available
    if ((window as any).SEB && (window as any).SEB.configKey) {
      return (window as any).SEB.configKey;
    }
    return null;
  }

  static getSEBVersion(): string | null {
    if ((window as any).SEB && (window as any).SEB.version) {
      return (window as any).SEB.version;
    }
    return null;
  }
}

/**
 * Multiple tab detection using BroadcastChannel
 */
export class MultiTabDetector {
  private channel: BroadcastChannel;
  private sessionId: string;
  private userEmail?: string;
  private onMultipleTabDetected?: () => void;
  private isActive: boolean = true;

  constructor(
    sessionId: string,
    userEmail?: string,
    onMultipleTabDetected?: () => void
  ) {
    this.sessionId = sessionId;
    this.userEmail = userEmail;
    this.onMultipleTabDetected = onMultipleTabDetected;
    this.channel = new BroadcastChannel(`quiz_session_${sessionId}`);
  }

  start() {
    // Listen for messages from other tabs
    this.channel.addEventListener('message', this.handleMessage);
    
    // Announce this tab's presence
    this.channel.postMessage({ type: 'tab_opened', timestamp: Date.now() });
    
    // Periodically announce presence
    setInterval(() => {
      if (this.isActive) {
        this.channel.postMessage({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, 2000);
  }

  stop() {
    this.isActive = false;
    this.channel.postMessage({ type: 'tab_closed', timestamp: Date.now() });
    this.channel.close();
  }

  private handleMessage = (event: MessageEvent) => {
    const { type } = event.data;
    
    if (type === 'tab_opened' || type === 'heartbeat') {
      // Another tab detected
      logProctorEvent('multiple_tab', this.sessionId, this.userEmail, {
        event: type,
      });
      
      if (this.onMultipleTabDetected) {
        this.onMultipleTabDetected();
      }
    }
  };
}

/**
 * Enhanced browser lockdown
 */
export class BrowserLockdown {
  private sessionId: string;
  private userEmail?: string;
  private onViolation?: (type: string) => void;

  constructor(
    sessionId: string,
    userEmail?: string,
    onViolation?: (type: string) => void
  ) {
    this.sessionId = sessionId;
    this.userEmail = userEmail;
    this.onViolation = onViolation;
  }

  start() {
    // Disable right-click
    document.addEventListener('contextmenu', this.handleContextMenu);
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Disable text selection
    document.addEventListener('selectstart', this.handleSelectStart);
    
    // Disable drag
    document.addEventListener('dragstart', this.handleDragStart);
  }

  stop() {
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('selectstart', this.handleSelectStart);
    document.removeEventListener('dragstart', this.handleDragStart);
  }

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    this.logViolation('right_click');
    this.showWarning('Right-click is disabled during the exam');
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) ||
      (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
      this.logViolation('devtools');
      this.showWarning('Developer tools are disabled during the exam');
      return;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      this.logViolation('keyboard_shortcut');
      this.showWarning('Viewing source is disabled during the exam');
      return;
    }
    
    // Ctrl+P (Print)
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      this.logViolation('keyboard_shortcut');
      this.showWarning('Printing is disabled during the exam');
      return;
    }
    
    // Ctrl+A (Select All)
    if (e.ctrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      this.logViolation('keyboard_shortcut');
      return;
    }
  };

  private handleSelectStart = (e: Event) => {
    // Allow selection only in input fields
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea')) {
      e.preventDefault();
    }
  };

  private handleDragStart = (e: DragEvent) => {
    e.preventDefault();
  };

  private logViolation(type: string) {
    logProctorEvent('keyboard_shortcut', this.sessionId, this.userEmail, { type });
    
    if (this.onViolation) {
      this.onViolation(type);
    }
  }

  private showWarning(message: string) {
    // Create temporary warning overlay
    const warning = document.createElement('div');
    warning.textContent = message;
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideDown 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(warning);
    
    setTimeout(() => {
      document.body.removeChild(warning);
      document.head.removeChild(style);
    }, 3000);
  }
}