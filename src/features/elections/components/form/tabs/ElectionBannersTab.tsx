
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ElectionFormValues } from "@/features/elections/types/electionFormTypes";
import ElectionBannerUpload from "../../ElectionBannerUpload";
import { Image, X, Eye } from "lucide-react";

const ElectionBannersTab = () => {
  const { watch, setValue } = useFormContext<ElectionFormValues>();
  const bannerUrls = watch("banner_urls") || [];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const handleViewBanner = (index: number, e: React.MouseEvent) => {
    // Prevent form submission when viewing banner
    e.preventDefault();
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleRemoveBanner = (index: number, e: React.MouseEvent) => {
    // Prevent form submission when removing banner
    e.preventDefault();
    const updatedBanners = [...bannerUrls];
    updatedBanners.splice(index, 1);
    setValue("banner_urls", updatedBanners);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Election Banners</h2>
      <p className="text-muted-foreground">
        Upload banner images for your election. These will be displayed at the top of the election page.
      </p>

      <FormField
        name="banner_urls"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload Banners</FormLabel>
            <ElectionBannerUpload
              banners={field.value || []}
              onChange={(urls) => {
                field.onChange(urls);
              }}
            />
          </FormItem>
        )}
      />

      {bannerUrls.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Banners</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bannerUrls.map((url, index) => (
              <div key={index} className="relative border rounded-md overflow-hidden">
                <img
                  src={url}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleViewBanner(index, e)}
                    type="button"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => handleRemoveBanner(index, e)}
                    type="button"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Banner Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={bannerUrls[previewIndex] || ""}
              alt="Banner Preview"
              className="w-full h-auto rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ElectionBannersTab;
