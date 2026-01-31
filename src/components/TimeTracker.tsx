import { useState, useEffect } from 'react';
import { Play, Square, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';

interface TimeEntry {
  id: string;
  description: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
}

export function TimeTracker() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && currentStart) {
      interval = setInterval(() => {
        const now = new Date();
        setElapsed(Math.floor((now.getTime() - currentStart.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => clearInterval(interval);
  }, [isTracking, currentStart]);

  const handleStart = () => {
    if (!description.trim()) return; // Prevent empty tasks if desired, or allow them
    setIsTracking(true);
    setCurrentStart(new Date());
  };

  const handleStop = () => {
    if (!currentStart) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentStart.getTime()) / 1000);

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      description: description || '(No description)',
      startTime: currentStart,
      endTime,
      duration,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsTracking(false);
    setCurrentStart(null);
    setDescription('');
    setElapsed(0);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock className="w-6 h-6 text-primary" />
            Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isTracking}
              className="flex-1 text-lg"
            />
            <div className="text-3xl font-mono font-bold w-32 text-center tabular-nums">
              {formatDuration(elapsed)}
            </div>
            <Button
              size="lg"
              onClick={isTracking ? handleStop : handleStart}
              variant={isTracking ? "destructive" : "default"}
              className="w-full md:w-32 transition-all"
              disabled={!isTracking && !description.trim()}
            >
              {isTracking ? (
                <>
                  <Square className="w-4 h-4 mr-2" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Start
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Clock className="w-10 h-10 mb-2 opacity-20" />
                <p>No time entries yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell>{format(entry.startTime, 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(entry.startTime, 'HH:mm:ss')}</TableCell>
                      <TableCell>{format(entry.endTime, 'HH:mm:ss')}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatDuration(entry.duration)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
