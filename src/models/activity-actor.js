import type { BackendActivityActor, SignedUrl } from '../types';

export class ActivityActor {
  id: string;
  smallPictureUri: SignedUrl;
  mediumPictureUri: SignedUrl;
  largePicureUri: SignedUrl;
  image: {
    url: SignedUrl;
  };
  thumbnailUrl: SignedUrl;
  mime: MimeType;
  wideImageUrl: SignedUrl;

  constructor(object: BackendActivityActor) {
    this.id = object['oae:id'];
    this.smallPictureUri = object.picture?.smallUri;
    this.mediumPictureUri = object.picture?.mediumUri;
    this.largePicureUri = object.picture?.largeUri;
    this.image = object.image;
    this.thumbnailUrl = object.thumbnailUrl;
    // TODO check this
    this.mime = object['oae:mimeType'] as unknown as MimeType;
    this.wideImageUrl = object['oae:wideImage']?.url;
  }
}
