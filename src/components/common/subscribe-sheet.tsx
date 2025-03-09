import { type FC } from "@/lib/vendors";
import { Button } from "@/components/common/ui/button";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Banner } from "./banner";

interface SubscribeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  price?: number;
  persistent?: boolean;
  hasBottomTabs?: boolean;
}

export const SubscribeSheet: FC<SubscribeSheetProps> = ({ 
  isOpen, 
  onClose, 
  message, 
  price = 9.99,
  persistent = false,
  hasBottomTabs = false
}) => {
  return (
    <Banner
      isOpen={isOpen}
      onClose={onClose}
      position={hasBottomTabs ? 'bottom-with-tabs' : 'bottom'}
      persistent={persistent}
      showCloseButton
      containerClassName=""
    >
      <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        {/* Message */}
        <p className="text-center text-gray-600 text-sm pr-6">{message}</p>

        {/* Bottom Section */}
        <div className="flex items-center justify-between border-t pt-4 sticky bottom-0 bg-white">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Price</span>
            <div className="flex items-center gap-0.5">
              <IndianRupee className="h-4 w-4 text-[#FF4D00]" />
              <span className="text-2xl font-bold text-[#FF4D00]">{price}</span>
            </div>
          </div>
          
          {/* Subscribe Button */}
          <Button 
            size="lg" 
            className={cn(
              "rounded-full bg-[#FF4D00] hover:bg-[#FF3D00]",
              "font-semibold text-white px-8 py-2 text-base"
            )}
            onClick={onClose}
          >
            Subscribe Now!
          </Button>
        </div>
      </div>
    </Banner>
  );
};
