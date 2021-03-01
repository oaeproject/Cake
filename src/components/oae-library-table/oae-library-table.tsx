import { Component, h } from '@stencil/core';

@Component({
  tag: 'oae-library-table',
  styleUrl: 'oae-library-table.scss',
})

export class LibraryTable {
  render() {
    return (
    <div class="columns is-flex table-wrap">
        <div class="library-box library-content library-padding ">
            <table class="table is-fullwidth lib-table">
                <thead>
                    <tr class="library-columns library-top">
                    <th>
                        <label htmlFor="checkbox">
                            <input type="checkbox"/>
                        </label>
                    </th>
                        <th><p>Name</p></th>
                        <th><p>Owner</p></th>
                        <th><p>Last modified</p></th>
                        <th><p>File type</p></th>
                    </tr>
                </thead>
                <tbody class="library-section">
                    <tr class="library-designation-label is-size-6">
                        <th><div class="field">
                                <p class="control">
                                    <div class="b-checkbox">
                                        <label htmlFor="checkbox">
                                        <input type="checkbox"/>
                                        </label>
                                    </div>
                                </p>
                            </div>
                        </th>
                        <td>
                            <p class="has-text-weight-bold">Redesign</p>
                            <section class="level library-designation-wrap is-inline-flex">
                                <div class="level-left">
                                    <div class="level-item">
                                        <p class="library-designation-hover">Design Matters</p>
                                    </div>
                                    <div class="level-item library-designation-tag"></div>
                                </div>
                            </section>
                        </td>
                        <td><p class="has-text-weight-medium">Rita Carvalho</p></td>
                        <td><p class="has-text-weight-medium">27/10/2018</p></td>
                        <td><p class="has-text-weight-medium">Folder</p></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    );
  }
}
