import { useState, useRef, useEffect, type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { Slider } from "@/components/common/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "@/assets/icons";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
}

const AudioPlayer: FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  }, [audioRef]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value[0];
      setVolume(value[0]);
    }
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <audio ref={audioRef} src={audioUrl} />

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      </div>

      <div className="mb-4">
        <Slider value={[currentTime]} min={0} max={duration} step={1} onValueChange={handleSeek} className="w-full" />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSkipBack} className="h-8 w-8 rounded-full p-0">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button onClick={handlePlayPause} className="h-10 w-10 rounded-full p-0">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSkipForward} className="h-8 w-8 rounded-full p-0">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <Slider value={[volume]} min={0} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-24" />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
