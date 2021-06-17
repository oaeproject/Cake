// import { BackendActivityActor, SignedUrl } from '../types';

export class ActivityActor {
  /** @type {string} */
  id;

  /** @type {SignedUrl} */
  smallPictureUri;

  /** @type {SignedUrl} */
  mediumPictureUri;

  /** @type {SignedUrl} */
  largePicureUri;

  /** @type {SignedUrl} */
  imageUrl;

  /** @type {SignedUrl} */
  thumbnailUrl;

  /** @type {MimeType} */
  mime;

  /** @type {SignedUrl} */
  wideImageUrl;

  constructor(actorData) {
    this.id = actorData['oae:id'];
    this.smallPictureUri = actorData.picture?.smallUri;
    this.mediumPictureUri = actorData.picture?.mediumUri;
    this.largePicureUri = actorData.picture?.largeUri;
    this.imageUrl = actorData?.image;
    this.thumbnailUrl = actorData?.thumbnailUrl;
    // TODO check this
    this.mime = actorData['oae:mimeType'];
    this.wideImageUrl = actorData['oae:wideImage']?.url;
  }
}
