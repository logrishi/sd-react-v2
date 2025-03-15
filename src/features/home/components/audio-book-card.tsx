import { type FC } from "@/lib/vendors";
import { Card } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { Headphones, Lock, Bookmark as BookmarkIcon } from "@/assets/icons";
import { getEnvVar } from "@/lib/utils/env-vars";
import AudioPlayer from "@/components/common/audio-player";
import { Button } from "@/components/common/ui/button";

interface AudioBookCardProps {
  id: number;
  name: string;
  audio: string;
  isFree: boolean;
  canPlay: boolean;
  bookmarkedBooks?: number[];
  onBookmarkToggle?: (id: number) => void;
}

const AudioBookCard: FC<AudioBookCardProps> = ({
  id,
  name,
  audio,
  isFree,
  canPlay,
  bookmarkedBooks = [],
  onBookmarkToggle,
}) => {
  return (
    <Card className="flex items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="rounded-full bg-primary/10 p-2">
          <Headphones className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium leading-none tracking-tight truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-2">
            {isFree ? (
              <Badge variant="secondary" className="bg-success text-white hover:bg-success/20">
                Free
              </Badge>
            ) : null}
            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(id);
                }}
              >
                <BookmarkIcon className="h-4 w-4" fill={bookmarkedBooks.includes(id) ? "currentColor" : "none"} />
              </Button>
            )}
          </div>
        </div>
      </div>
      {canPlay ? (
        <AudioPlayer audioUrl={`${getEnvVar("VITE_IMAGE_URL")}/${audio}`} miniPlayer title={name} />
      ) : (
        <div className="rounded-full bg-muted p-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </Card>
  );
};

export default AudioBookCard;
