import { NextRequest, NextResponse } from 'next/server';

export interface ProctorEvent {
  type: 'screenshot' | 'tab_switch' | 'copy' | 'paste' | 'devtools' | 'right_click' | 'keyboard_shortcut' | 'mouse_inactive' | 'mouse_edge' | 'clipboard_clear' | 'multiple_tab' | 'seb_violation';
  timestamp: number;
  sessionId: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

const eventStore: ProctorEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const event: ProctorEvent = await request.json();
    
    // Validate event
    if (!event.type || !event.timestamp || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, timestamp, sessionId' },
        { status: 400 }
      );
    }
    

    eventStore.push({
      ...event,
      timestamp: Date.now(), 
    });
    
    console.log('Proctor event logged:', event);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event logged successfully',
      eventId: eventStore.length - 1
    });
  } catch (error) {
    console.error('Error logging proctor event:', error);
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (sessionId) {
      const sessionEvents = eventStore.filter(e => e.sessionId === sessionId);
      return NextResponse.json({ events: sessionEvents, count: sessionEvents.length });
    }
    
    return NextResponse.json({ events: eventStore, count: eventStore.length });
  } catch (error) {
    console.error('Error retrieving proctor events:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}