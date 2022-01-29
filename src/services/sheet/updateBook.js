/**
 * Update a book in the sheet.
 *
 * @param {string} sheetId The ID of the sheet to update the book.
 * @param {import('../../model/Book').default} book The book to update.
 */
export default async function updateBook (sheetId, book) {
  const bookFormatted = book.toArray()

  await window.gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: sheetId,
      range: book.sheetLocation,
      valueInputOption: 'USER_ENTERED',
      values: [bookFormatted]
    })
}