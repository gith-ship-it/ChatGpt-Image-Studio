import type { ImageConversation, StoredImage, StoredSourceImage } from "@/store/image-conversations";

export function buildImageDataUrl(image: StoredImage) {
  if (!image.b64_json) {
    return "";
  }
  return `data:image/png;base64,${image.b64_json}`;
}

export function buildConversationSourceLabel(source: StoredSourceImage) {
  return source.role === "mask" ? "选区 / 遮罩" : "源图";
}

export function buildConversationPreviewSource(conversation: ImageConversation) {
  const latestSuccessfulImage = conversation.images.find((image) => image.status === "success" && image.b64_json);
  if (latestSuccessfulImage) {
    return buildImageDataUrl(latestSuccessfulImage);
  }

  const firstSourceImage = conversation.sourceImages?.find((item) => item.role === "image");
  return firstSourceImage?.dataUrl || "";
}
