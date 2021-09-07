import { nanoid } from 'nanoid'

import { PUBLISHER_REPLACEMENTS } from '../services/lookup/Cbl'
import {
  ean as validateEan,
  isbn as validateIsbn,
  issn as validateIssn
} from '../util/validators'

import i18n from '../i18n'

const { n, locale } = i18n.global

export const Columns = {
  ID: 0,
  CODE: 1,
  GROUP: 2,
  TITLE: 3,
  AUTHORS: 4,
  PUBLISHER: 5,
  DIMENSIONS: 6,
  STATUS: 7,
  READ_AT: 8,
  LABEL_PRICE: 9,
  PAID_PRICE: 10,
  STORE: 11,
  COVER_URL: 12,
  BOUGHT_AT: 13,
  FAVORITE: 14,
  SYNOPSIS: 15,
  NOTES: 16,
  CREATED_AT: 17,
  UPDATED_AT: 18
}

export const CollectionColumns = {
  ID: 'B',
  CODE: 'C',
  GROUP: 'D',
  TITLE: 'E',
  AUTHORS: 'F',
  PUBLISHER: 'G',
  DIMENSIONS: 'H',
  STATUS: 'I',
  READ_AT: 'J',
  LABEL_PRICE: 'K',
  PAID_PRICE: 'L',
  STORE: 'M',
  COVER_URL: 'N',
  BOUGHT_AT: 'O',
  FAVORITE: 'P',
  SYNOPSIS: 'Q',
  NOTES: 'R',
  CREATED_AT: 'S',
  UPDATED_AT: 'T'
}

export const PropertyToColumn = {
  title: CollectionColumns.TITLE,
  publisher: CollectionColumns.PUBLISHER,
  status: CollectionColumns.STATUS,
  'paidPrice.value': CollectionColumns.PAID_PRICE,
  'labelPrice.value': CollectionColumns.LABEL_PRICE,
  boughtAt: CollectionColumns.BOUGHT_AT,
  readAt: CollectionColumns.READ_AT,
  createdAt: CollectionColumns.CREATED_AT,
  updatedAt: CollectionColumns.UPDATED_AT
}

export const BookStatus = {
  READ: 'READ',
  UNREAD: 'UNREAD'
}

export const BookFavorite = {
  ACTIVE: 'YES',
  INACTIVE: ''
}

export function parseBook (value, index) {
  const labelPrice = value[Columns.LABEL_PRICE].split(' ')
  const paidPrice = value[Columns.PAID_PRICE].split(' ')

  return {
    sheetLocation: `Collection!B${index + 5}`,
    id: value[Columns.ID],
    code: value[Columns.CODE],
    codeType: getCodeType(value[Columns.CODE]),
    group: value[Columns.GROUP],
    title: value[Columns.TITLE],
    titleParts: splitTitle(value[Columns.TITLE]),
    authors: value[Columns.AUTHORS].split(/;\s+/g),
    authorsStr: value[Columns.AUTHORS],
    publisher: value[Columns.PUBLISHER],
    dimensions: value[Columns.DIMENSIONS].split(' × ')
      .map(measure => n(parseFloat(measure), 'dimensions'))
      .join(' × '),
    status: value[Columns.STATUS],
    readAt: value[Columns.READ_AT].length > 0
      ? new Date(value[Columns.READ_AT])
      : null,
    labelPrice: {
      currency: labelPrice[0],
      value: n(labelPrice[1] ? parseFloat(labelPrice[1]) : 0.0, 'decimal')
    },
    paidPrice: {
      currency: paidPrice[0],
      value: n(paidPrice[1] ? parseFloat(paidPrice[1]) : 0.0, 'decimal')
    },
    labelPriceCurrency: labelPrice[0],
    labelPriceValue: n(labelPrice[1] ? parseFloat(labelPrice[1]) : 0.0, 'decimal'),
    paidPriceCurrency: paidPrice[0],
    paidPriceValue: n(paidPrice[1] ? parseFloat(paidPrice[1]) : 0.0, 'decimal'),
    store: value[Columns.STORE],
    coverUrl: value[Columns.COVER_URL],
    boughtAt: value[Columns.BOUGHT_AT].length > 0
      ? new Date(value[Columns.BOUGHT_AT])
      : null,
    favorite: value[Columns.FAVORITE],
    synopsis: value[Columns.SYNOPSIS],
    notes: value[Columns.NOTES],
    createdAt: new Date(value[Columns.CREATED_AT]),
    updatedAt: new Date(value[Columns.UPDATED_AT])
  }
}

export function parseBookFromDataTable (dataTable, idMap, i) {
  function getProperty (column) {
    return dataTable.getValue(i, column)
  }

  const id = getProperty(Columns.ID)
  const labelPrice = getProperty(Columns.LABEL_PRICE).split(' ')
  const paidPrice = getProperty(Columns.PAID_PRICE).split(' ')

  return {
    sheetLocation: `Collection!B${idMap[id]}`,
    id,
    code: getProperty(Columns.CODE),
    codeType: getCodeType(getProperty(Columns.CODE)),
    group: getProperty(Columns.GROUP),
    title: getProperty(Columns.TITLE),
    titleParts: splitTitle(getProperty(Columns.TITLE)),
    authors: getProperty(Columns.AUTHORS).split(/;\s+/g),
    authorsStr: getProperty(Columns.AUTHORS),
    publisher: getProperty(Columns.PUBLISHER),
    dimensions: getProperty(Columns.DIMENSIONS).split(' × ')
      .map(measure => n(parseFloat(measure), 'dimensions'))
      .join(' × '),
    status: getProperty(Columns.STATUS),
    readAt: getProperty(Columns.READ_AT),
    labelPrice: {
      currency: labelPrice[0],
      value: n(labelPrice[1] ? parseFloat(labelPrice[1]) : 0.0, 'decimal')
    },
    paidPrice: {
      currency: paidPrice[0],
      value: n(paidPrice[1] ? parseFloat(paidPrice[1]) : 0.0, 'decimal')
    },
    labelPriceCurrency: labelPrice[0],
    labelPriceValue: n(labelPrice[1] ? parseFloat(labelPrice[1]) : 0.0, 'decimal'),
    paidPriceCurrency: paidPrice[0],
    paidPriceValue: n(paidPrice[1] ? parseFloat(paidPrice[1]) : 0.0, 'decimal'),
    store: getProperty(Columns.STORE),
    coverUrl: getProperty(Columns.COVER_URL) || '',
    boughtAt: getProperty(Columns.BOUGHT_AT),
    favorite: getProperty(Columns.FAVORITE) || '',
    synopsis: getProperty(Columns.SYNOPSIS) || '',
    notes: getProperty(Columns.NOTES) || '',
    createdAt: getProperty(Columns.CREATED_AT),
    updatedAt: getProperty(Columns.UPDATED_AT)
  }
}

function formatDateToSheet (date) {
  return `=DATE(${date.getFullYear()}, ${date.getMonth() + 1}, ${date.getDate()})`
}

function formatDateTimeToSheet (date) {
  return formatDateToSheet(date) + ' + ' +
    `TIME(${date.getHours()}, ${date.getMinutes()}, ${date.getSeconds()})`
}

export function formatBook (book) {
  return [
    book.id || nanoid(),
    book.code.replace(/^(\d{3})(\d{2})(\d{4})(\d{3})(\d{1})$/, '$1-$2-$3-$4-$5'),
    book.group,
    book.title,
    book.authors.join('; '),
    book.publisher,
    book.dimensions.replace(
      /^(\d+(?:(?:\.|,)\d{1,2})?) (?:x|×) (\d+(?:(?:\.|,)\d{1,2})?)$/,
      (m, p1, p2) => {
        return n(parseFloat(p1.replace(',', '.')), 'dimensions', 'en-US') +
          ' × ' + n(parseFloat(p2.replace(',', '.')), 'dimensions', 'en-US')
      }
    ),
    book.status || BookStatus.UNREAD,
    book.readAt ? formatDateToSheet(book.readAt) : '',
    book.labelPrice.currency + ' ' +
      n(parseFloat(book.labelPrice.value.replace(',', '.')), 'decimal', 'en-US'),
    book.paidPrice.currency + ' ' +
      n(parseFloat(book.paidPrice.value.replace(',', '.')), 'decimal', 'en-US'),
    book.store,
    book.coverUrl || '',
    book.boughtAt ? formatDateToSheet(book.boughtAt) : '',
    book.favorite || BookFavorite.INACTIVE,
    book.synopsis || '',
    book.notes || '',
    formatDateTimeToSheet(book.createdAt || new Date()),
    formatDateTimeToSheet(new Date())
  ]
}

export function splitTitle (title) {
  const titleRegex = /\s+#(\d+)(?::\s+)?/
  return title.split(titleRegex)
}

export function getCodeType (code) {
  code = code.replace(/-/g, '')

  if (validateIsbn(code)) {
    return 'ISBN-' + code.length
  }

  if (validateIssn(code)) {
    return 'ISSN'
  }

  if (validateEan(code)) {
    return 'EAN-13'
  }

  return code !== 'N/A' ? 'ID' : 'N/A'
}

export function parseBookFromCbl (cblBook) {
  const allowedRoles = ['Autor', 'Ilustrador', 'Roteirista']

  return {
    code: cblBook.RowKey,
    codeType: cblBook.RowKey.length === 13 ? 'ISBN-13' : 'ISBN-10',
    title: cblBook.Title.trim()
      .replace(/(?::| -)? ?(?:v|vol|volume)?(?:\.|:)? ?(\d+)$/i, ' #$1')
      .replace(/#(\d{1})$/, '#0$1'),
    authors: cblBook.Profissoes && cblBook.Profissoes.length >= cblBook.Authors.length
      ? cblBook.Authors.filter((_, i) => allowedRoles.includes(cblBook.Profissoes[i]))
      : cblBook.Authors,
    publisher: PUBLISHER_REPLACEMENTS[cblBook.Imprint] || cblBook.Imprint,
    dimensions: cblBook.Dimensao
      ? cblBook.Dimensao.replace(/(\d{2})(\d)?x(\d{2})(\d)?$/, (m, p1, p2, p3, p4) => {
        return n(parseFloat(p1 + (p2 ? '.' + p2 : '')), 'dimensions') + ' x ' +
          n(parseFloat(p3 + (p4 ? '.' + p4 : '')), 'dimensions')
      })
      : '',
    synopsis: cblBook.Sinopse || '',
    provider: 'CBL'
  }
}

export function parseBookFromOpenLibrary (openLibraryBook, details) {
  const code = openLibraryBook.identifiers.isbn_13
    ? openLibraryBook.identifiers.isbn_13[0]
    : openLibraryBook.identifiers.isbn_10[0]

  let book = {
    code,
    codeType: code.length === 13 ? 'ISBN-13' : 'ISBN-10',
    title: openLibraryBook.title.trim()
      .replace(/(?::| -)? ?(?:v|vol|volume)?(?:\.|:)? ?(\d+)$/i, ' #$1')
      .replace(/#(\d{1})$/, '#0$1'),
    authors: (openLibraryBook.authors || []).map(author => author.name),
    publisher: openLibraryBook.publishers.length > 0 ? openLibraryBook.publishers[0].name : '',
    coverUrl: openLibraryBook.cover ? openLibraryBook.cover.large : '',
    provider: 'Open Library'
  }

  if (details) {
    const physicalDimensions = details.physical_dimensions || ''
    const dimensions = physicalDimensions
      .replace(' centimeters', '')
      .split(' x ')
      .map(parseFloat)
      .filter(dm => !isNaN(dm))

    book = {
      ...book,
      synopsis: details.description?.type === '/type/text'
        ? details.description.value
        : '',
      dimensions: physicalDimensions.includes('centimeters') && dimensions.length === 3
        ? n(dimensions[1], 'dimensions') + ' x ' + n(dimensions[0], 'dimensions')
        : ''
    }
  }

  return book
}

export function parseBookFromGoogleBooks (googleBook) {
  const volumeInfo = googleBook.volumeInfo
  const isbn13 = (volumeInfo.industryIdentifiers || [])
    .find(identifier => identifier.type === 'ISBN_13')
  const isbn10 = (volumeInfo.industryIdentifiers || [])
    .find(identifier => identifier.type === 'ISBN_10')

  const width = volumeInfo.dimensions
    ? parseFloat(volumeInfo.dimensions.width.replace(/\s(.*)$/, ''))
    : null
  const height = volumeInfo.dimensions
    ? parseFloat(volumeInfo.dimensions.height.replace(/\s(.*)$/, ''))
    : null

  return {
    code: isbn13 ? isbn13.identifier : isbn10.identifier,
    codeType: isbn13 ? 'ISBN-13' : 'ISBN-10',
    title: volumeInfo.title.trim()
      .replace(/(?::| -)? ?(?:v|vol|volume)?(?:\.|:)? ?(\d+)$/i, ' #$1')
      .replace(/#(\d{1})$/, '#0$1'),
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher || '',
    synopsis: volumeInfo.description || '',
    dimensions: width && height
      ? `${n(width, 'dimensions')} x ${n(height, 'dimensions')}`
      : '',
    provider: 'Google Books'
  }
}

export function bookCompare (a, b) {
  return a.group.localeCompare(b.group, locale.value) ||
    a.titleParts[0].localeCompare(b.titleParts[0], locale.value) ||
    a.publisher.localeCompare(b.publisher, locale.value) ||
    (a.titleParts[1] || '01').localeCompare(b.titleParts[1] || '01', locale.value)
}
