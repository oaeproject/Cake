import Path from "path";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import fs from "fs";
import util from "util";
import { expect } from "chai";
import {
  convertFolderTreeToObject,
  cleanEmptyEntries,
} from "../scripts/conversion-utils";
import { compose, split, __, path, keys } from "ramda";
import { check } from "yargs";

describe("Convertion of 3akai-ux properties files", () => {
  let repoPath = Path.join(process.cwd(), "test-clone");
  let convertedTranslations;
  let noKeysOfNestedPath;
  let checkNestedEntryBundles;

  before(async () => {
    // let's clone 3akai-ux here so we can access translations
    await git.clone({
      fs,
      http,
      dir: repoPath,
      url: "https://github.com/oaeproject/3akai-ux",
    });
  });

  after(async () => {
    try {
      await util.promisify(fs.access)(
        repoPath,
        fs.constants.F_OK | fs.constants.W_OK
      );
      await util.promisify(fs.rm)(repoPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Unable to delete repo folder. Something's not right.");
      console.log(error);
    }
  });

  const setupContext = async (locale) => {
    convertedTranslations = await convertFolderTreeToObject(
      locale,
      repoPath,
      {},
      true
    ).then(cleanEmptyEntries);

    noKeysOfNestedPath = compose(
      keys,
      path(__, convertedTranslations),
      split(".")
    );
    checkNestedEntryBundles = (nestedPath, noKeys) => {
      expect(convertedTranslations).to.have.nested.property(nestedPath);
      expect(noKeysOfNestedPath(nestedPath)).to.have.lengthOf(noKeys);
    };
  };

  it("British English json file is generated", async () => {
    let locale = "en_GB";
    await setupContext(locale);

    expect(convertedTranslations).to.be.an("object");
    checkNestedEntryBundles("shared.oae.bundles.email", 23);
    checkNestedEntryBundles("shared.oae.bundles.ui", 762);
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.aboutmeeting-jitsi.bundles",
      2
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.meetings-jitsi-library.bundles",
      5
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.editmeeting-jitsi.bundles",
      10
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.createmeeting.bundles",
      10
    );
    checkNestedEntryBundles("packages.oae-admin.importusers.bundles", 17);
    checkNestedEntryBundles("packages.oae-admin.configuration.bundles", 7);
    checkNestedEntryBundles("packages.oae-admin.usermanagement.bundles", 4);
    checkNestedEntryBundles("packages.oae-admin.skinning.bundles", 10);
    checkNestedEntryBundles("packages.oae-admin.createuser.bundles", 11);
    checkNestedEntryBundles("packages.oae-admin.tenants.bundles", 55);
    checkNestedEntryBundles("packages.oae-admin.createtenant.bundles", 6);
    checkNestedEntryBundles("packages.oae-admin.manageuser.bundles", 33);
    checkNestedEntryBundles("packages.oae-admin.maintenance.bundles", 29);
    checkNestedEntryBundles("packages.oae-admin.adminheader.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.editprofile.bundles", 24);
    checkNestedEntryBundles("packages.oae-core.ethercalc.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.comments.bundles", 9);
    checkNestedEntryBundles("packages.oae-core.footer.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.changepic.bundles", 17);
    checkNestedEntryBundles("packages.oae-core.preferences.bundles", 34);
    checkNestedEntryBundles("packages.oae-core.editdiscussion.bundles", 4);
    checkNestedEntryBundles("packages.oae-core.etherpad.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creategroup.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creategroup.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletecomment.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.createcollabsheet.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.createcollabdoc.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.activity.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.joingroup.bundles", 10);
    checkNestedEntryBundles("packages.oae-core.contentlibrary.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.lhnavigation.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.network.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.groupprofile.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletefolder.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.termsandconditions.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deleteresources.bundles", 44);
    checkNestedEntryBundles("packages.oae-core.documentpreview.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.leavegroup.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.unfollow.bundles", 10);
    checkNestedEntryBundles("packages.oae-core.aboutlti.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.topnavigation.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.setpermissions.bundles", 154);
    checkNestedEntryBundles("packages.oae-core.discussionslibrary.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.memberships.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.resetpassword.bundles", 11);
    checkNestedEntryBundles("packages.oae-core.manageaccess.bundles", 27);
    checkNestedEntryBundles(
      "packages.oae-core.foldercontentvisibility.bundles",
      16
    );
    checkNestedEntryBundles("packages.oae-core.createlink.bundles", 13);
    checkNestedEntryBundles("packages.oae-core.uploadnewversion.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.members.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.createlti.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.linkpreview.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.revisions.bundles", 9);
    checkNestedEntryBundles("packages.oae-core.createfolder.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.folderlibrary.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.exportdata.bundles", 12);
    checkNestedEntryBundles("packages.oae-core.aboutdiscussion.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.listlti.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.editgroup.bundles", 13);
    checkNestedEntryBundles("packages.oae-core.filepreview.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creatediscussion.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.addtofolder.bundles", 17);
    checkNestedEntryBundles("packages.oae-core.editfolder.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.notifications.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.aboutcontent.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletelti.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.upload.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.editcontent.bundles", 12);
    checkNestedEntryBundles("packages.oae-core.share.bundles", 61);
  });

  it("French json file is generated", async () => {
    let locale = "en_GB";
    await setupContext(locale);

    expect(convertedTranslations).to.be.an("object");
    checkNestedEntryBundles("shared.oae.bundles.email", 23);
    checkNestedEntryBundles("shared.oae.bundles.ui", 762);
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.aboutmeeting-jitsi.bundles",
      2
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.meetings-jitsi-library.bundles",
      5
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.editmeeting-jitsi.bundles",
      10
    );
    checkNestedEntryBundles(
      "packages.oae-jitsi-widgets.createmeeting.bundles",
      10
    );
    checkNestedEntryBundles("packages.oae-admin.importusers.bundles", 17);
    checkNestedEntryBundles("packages.oae-admin.configuration.bundles", 7);
    checkNestedEntryBundles("packages.oae-admin.usermanagement.bundles", 4);
    checkNestedEntryBundles("packages.oae-admin.skinning.bundles", 10);
    checkNestedEntryBundles("packages.oae-admin.createuser.bundles", 11);
    checkNestedEntryBundles("packages.oae-admin.tenants.bundles", 55);
    checkNestedEntryBundles("packages.oae-admin.createtenant.bundles", 6);
    checkNestedEntryBundles("packages.oae-admin.manageuser.bundles", 33);
    checkNestedEntryBundles("packages.oae-admin.maintenance.bundles", 29);
    checkNestedEntryBundles("packages.oae-admin.adminheader.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.editprofile.bundles", 24);
    checkNestedEntryBundles("packages.oae-core.ethercalc.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.comments.bundles", 9);
    checkNestedEntryBundles("packages.oae-core.footer.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.changepic.bundles", 17);
    checkNestedEntryBundles("packages.oae-core.preferences.bundles", 34);
    checkNestedEntryBundles("packages.oae-core.editdiscussion.bundles", 4);
    checkNestedEntryBundles("packages.oae-core.etherpad.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creategroup.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creategroup.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletecomment.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.createcollabsheet.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.createcollabdoc.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.activity.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.joingroup.bundles", 10);
    checkNestedEntryBundles("packages.oae-core.contentlibrary.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.lhnavigation.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.network.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.groupprofile.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletefolder.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.termsandconditions.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deleteresources.bundles", 44);
    checkNestedEntryBundles("packages.oae-core.documentpreview.bundles", 8);
    checkNestedEntryBundles("packages.oae-core.leavegroup.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.unfollow.bundles", 10);
    checkNestedEntryBundles("packages.oae-core.aboutlti.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.topnavigation.bundles", 5);
    checkNestedEntryBundles("packages.oae-core.setpermissions.bundles", 154);
    checkNestedEntryBundles("packages.oae-core.discussionslibrary.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.memberships.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.resetpassword.bundles", 11);
    checkNestedEntryBundles("packages.oae-core.manageaccess.bundles", 27);
    checkNestedEntryBundles(
      "packages.oae-core.foldercontentvisibility.bundles",
      16
    );
    checkNestedEntryBundles("packages.oae-core.createlink.bundles", 13);
    checkNestedEntryBundles("packages.oae-core.uploadnewversion.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.members.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.createlti.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.linkpreview.bundles", 3);
    checkNestedEntryBundles("packages.oae-core.revisions.bundles", 9);
    checkNestedEntryBundles("packages.oae-core.createfolder.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.folderlibrary.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.exportdata.bundles", 12);
    checkNestedEntryBundles("packages.oae-core.aboutdiscussion.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.listlti.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.editgroup.bundles", 13);
    checkNestedEntryBundles("packages.oae-core.filepreview.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.creatediscussion.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.addtofolder.bundles", 17);
    checkNestedEntryBundles("packages.oae-core.editfolder.bundles", 6);
    checkNestedEntryBundles("packages.oae-core.notifications.bundles", 1);
    checkNestedEntryBundles("packages.oae-core.aboutcontent.bundles", 2);
    checkNestedEntryBundles("packages.oae-core.deletelti.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.upload.bundles", 14);
    checkNestedEntryBundles("packages.oae-core.editcontent.bundles", 12);
    checkNestedEntryBundles("packages.oae-core.share.bundles", 61);
  });
});
