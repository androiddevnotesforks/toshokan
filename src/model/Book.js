import { nanoid } from 'nanoid'

import { IMPRINT_REPLACEMENTS } from '../services/cbl'
import { isbn as validateIsbn, issn as validateIssn } from '../util/validators'

export function parseBook (value, index) {
  const format = value[6].split(' × ')
  const labelPrice = value[8].split(' ')
  const paidPrice = value[9].split(' ')

  return {
    sheetLocation: `Coleção!B${index + 5}`,
    id: value[0],
    code: value[1],
    codeType: getCodeType(value[1]),
    collection: value[2],
    title: value[3],
    titleParts: splitTitle(value[3]),
    authors: value[4].split(/;\s+/g),
    imprint: value[5],
    format: {
      width: parseFloat(format[0]) || 0.0,
      height: parseFloat(format[1]) || 0.0
    },
    status: value[7],
    labelPrice: {
      currency: labelPrice[0],
      value: parseFloat(labelPrice[1]) || 0.0
    },
    paidPrice: {
      currency: paidPrice[0],
      value: parseFloat(paidPrice[1]) || 0.0
    },
    store: value[10],
    coverUrl: value[11],
    boughtAt: new Date(value[12].split('/').reverse().join('-')),
    createdAt: new Date(value[13].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')),
    updatedAt: new Date(value[14].replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))
  }
}

const formatFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: false
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  useGrouping: false
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium'
})

export function formatBook (book) {
  return [
    book.id || nanoid(),
    book.code.replace(/^(\d{3})(\d{2})(\d{4})(\d{3})(\d{1})$/, '$1-$2-$3-$4-$5'),
    book.collection,
    book.title,
    book.authors.join('; '),
    book.imprint,
    book.format.replace(
      /^(\d+(?:(?:\.|,)\d{1,2})?) (?:x|×) (\d+(?:(?:\.|,)\d{1,2})?)$/,
      (m, p1, p2) => {
        return formatFormatter.format(p1.replace(',', '.')) +
          ' × ' + formatFormatter.format(p2.replace(',', '.'))
      }
    ),
    book.status || 'Não lido',
    book.labelPrice.currency + ' ' +
      priceFormatter.format(book.labelPrice.value.replace(',', '.')),
    book.paidPrice.currency + ' ' +
      priceFormatter.format(book.paidPrice.value.replace(',', '.')),
    book.store,
    book.coverUrl || '',
    book.boughtAt ? book.boughtAt.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1') : '',
    dateFormatter.format(book.createdAt || new Date()),
    dateFormatter.format(new Date())
  ]
}

export function splitTitle (title) {
  const titleRegex = /\s+#(\d+)(?::\s+)?/
  return title.split(titleRegex)
}

export function getCodeType (code) {
  code = code.replace(/-/g, '')

  if (code.match(/^789/)) {
    return 'EAN-13'
  }

  if (validateIsbn(code)) {
    return 'ISBN-' + code.length
  }

  if (validateIssn(code)) {
    return 'ISSN'
  }

  return code !== 'N/A' ? 'ID' : 'N/A'
}

export function parseBookFromCbl (cblBook) {
  return {
    code: cblBook.RowKey,
    title: cblBook.Title.trim()
      .replace(/(?::| -)? ?(?:v|vol|volume)?(?:\.|:)? ?(\d+)$/i, ' #$1')
      .replace(/#(\d{1})$/, '#0$1'),
    authors: cblBook.Authors,
    imprint: IMPRINT_REPLACEMENTS[cblBook.Imprint] || cblBook.Imprint
  }
}
