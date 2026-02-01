import asyncio
import json
from typing import Dict, Set
from datetime import datetime


class EventBroadcaster:
    """
    Simple in-memory pub/sub for SSE events.
    Each run_id has its own set of connected clients.
    """
    
    def __init__(self):
        self.channels: Dict[int, Set[asyncio.Queue]] = {}
    
    def subscribe(self, run_id: int) -> asyncio.Queue:
        """Subscribe to events for a specific run"""
        queue = asyncio.Queue()
        
        if run_id not in self.channels:
            self.channels[run_id] = set()
        
        self.channels[run_id].add(queue)
        return queue
    
    def unsubscribe(self, run_id: int, queue: asyncio.Queue):
        """Unsubscribe from events for a specific run"""
        if run_id in self.channels:
            self.channels[run_id].discard(queue)
            
            # Clean up empty channel
            if not self.channels[run_id]:
                del self.channels[run_id]
    
    async def publish(self, run_id: int, event_data: dict):
        """Publish an event to all subscribers of a run"""
        if run_id not in self.channels:
            return
        
        # Create SSE formatted message
        message = {
            "timestamp": datetime.utcnow().isoformat(),
            **event_data
        }
        
        # Send to all subscribers
        dead_queues = set()
        for queue in self.channels[run_id]:
            try:
                await queue.put(message)
            except Exception:
                dead_queues.add(queue)
        
        # Clean up dead queues
        for queue in dead_queues:
            self.channels[run_id].discard(queue)


# Global broadcaster instance
broadcaster = EventBroadcaster()
