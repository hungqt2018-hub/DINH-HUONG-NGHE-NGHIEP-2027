/**
 * Google Drive API v3 Service
 * Supports uploading JSON reports, PDFs, and Excel wishlists to Google Drive
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

/**
 * Finds or creates an application-specific folder in Google Drive
 */
export async function getOrCreateAppFolder(
  accessToken: string,
  folderName: string = 'LopToanThayHung_DinhHuong2027'
): Promise<string | null> {
  try {
    // Search for existing folder with this name created by the app
    const q = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id;
    }
  } catch (err) {
    console.warn('Could not create folder, saving to root instead:', err);
  }
  return null;
}

/**
 * Upload a JSON file (data record) to Google Drive
 */
export async function uploadJsonToDrive(
  fileName: string,
  jsonData: any,
  accessToken: string
): Promise<GoogleDriveFile> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/json',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const fileContent = JSON.stringify(jsonData, null, 2);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi tải lên Google Drive (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Upload a binary Blob (PDF or Excel) to Google Drive
 */
export async function uploadBlobToDrive(
  fileName: string,
  mimeType: string,
  blob: Blob,
  accessToken: string
): Promise<GoogleDriveFile> {
  const folderId = await getOrCreateAppFolder(accessToken);
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  // Convert blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n`;

  const metadataBytes = new TextEncoder().encode(metadataPart);
  const closeBytes = new TextEncoder().encode(closeDelimiter);

  // Combine metadata + binary content + close delimiter
  const totalLength = metadataBytes.length + uint8Array.length + closeBytes.length;
  const combinedBuffer = new Uint8Array(totalLength);
  combinedBuffer.set(metadataBytes, 0);
  combinedBuffer.set(uint8Array, metadataBytes.length);
  combinedBuffer.set(closeBytes, metadataBytes.length + uint8Array.length);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBuffer,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi tải lên Google Drive (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * List files created by this application in Google Drive
 */
export async function listAppDriveFiles(
  accessToken: string
): Promise<GoogleDriveFile[]> {
  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=20&orderBy=createdTime desc&fields=files(id,name,mimeType,webViewLink,createdTime)&q=trashed = false",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Lỗi lấy danh sách tệp Google Drive:', err);
    return [];
  }
}
