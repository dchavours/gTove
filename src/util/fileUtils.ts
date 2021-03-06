import {Dispatch} from 'redux';

import {updateFileAction} from '../redux/fileIndexReducer';
import {DriveMetadata, DriveUser, TabletopFileAppProperties} from '../@types/googleDrive';
import {ReduxStoreType} from '../redux/mainReducer';

export type AddFilesCallback = (files: DriveMetadata[]) => void;

export interface OnProgressParams {
    loaded: number;
    total: number;
}

export interface FileAPIContext {
    fileAPI: FileAPI;
}

export interface FileAPI {
    initialiseFileAPI: (callback: (signedIn: boolean) => void, onError: (error: Error) => void) => void;
    signInToFileAPI: () => void;
    signOutFromFileAPI: () => void;
    getLoggedInUserInfo: () => Promise<DriveUser>;
    loadRootFiles: (addFilesCallback: AddFilesCallback) => Promise<void>;
    loadFilesInFolder: (id: string, addFilesCallback: AddFilesCallback, pageToken?: string) => Promise<void>;
    getFullMetadata: (id: string) => Promise<DriveMetadata>;
    getFileModifiedTime: (id: string) => Promise<number>;
    createFolder: (folderName: string, metadata?: Partial<DriveMetadata>) => Promise<DriveMetadata>;
    uploadFile: (driveMetadata: Partial<DriveMetadata>, file: Blob, onProgress?: (progress: OnProgressParams) => void) => Promise<DriveMetadata>;
    saveJsonToFile: (driveMetadata: Partial<DriveMetadata>, json: object) => Promise<DriveMetadata>;
    updateFileMetadata: (metadata: Partial<DriveMetadata>) => Promise<DriveMetadata>;
    getFileContents: (metadata: Partial<DriveMetadata>) => Promise<object>;
    getJsonFileContents: (metadata: Partial<DriveMetadata>) => Promise<object>;
    makeFileReadableToAll: (metadata: Partial<DriveMetadata>) => Promise<void>;
}

export function updateFileMetadataAndDispatch(fileAPI: FileAPI, metadata: Partial<DriveMetadata>, dispatch: Dispatch<ReduxStoreType>, transmit: boolean = false) {
    return fileAPI.updateFileMetadata(metadata)
        .then((driveMetadata) => {
            if (driveMetadata.appProperties && (<TabletopFileAppProperties>driveMetadata.appProperties).gmFile) {
                // If there's an associated gmFile, update it as well
                dispatch(updateFileAction(driveMetadata, transmit ? driveMetadata.id : undefined));
                return fileAPI.updateFileMetadata({...metadata, id: (<TabletopFileAppProperties>driveMetadata.appProperties).gmFile});
            } else {
                return driveMetadata;
            }
        })
        .then((driveMetadata) => {
            dispatch(updateFileAction(driveMetadata, transmit ? driveMetadata.id : undefined));
        });
}

export function splitFileName(fileName: string): {name: string, suffix: string} {
    const match = fileName.match(/^(.*)(\.[a-zA-Z]*)?$/);
    if (match) {
        return {name: match[1] || '', suffix: match[2] || ''};
    } else {
        return {name: '', suffix: ''};
    }
}