import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'

import mock from '../books.json'

export interface Book {
  title: string
  pages: number
  genre: string
  cover: string
  synopsis: string
  year: number
  ISBN: string
  author: {
    name: string
    otherBooks: string[]
  }
}

const books: Book[] = mock.library.map(mock => mock.book)
const genres: string[] = Array.from(new Set(books.map(book => book.genre)))
const minPages = Math.min(...books.map(book => book.pages))
const maxPages = Math.max(...books.map(book => book.pages))

export const App: React.FC = () => {
  const [genre, setGenre] = useState<Book['genre']>('')
  const [view, setView] = useState<Book[]>([])
  const [pages, setPages] = useState<number>(maxPages)
  const [available, setAvailable] = useState<number>(0)

  const matches = useMemo(() => {
    return genre
      ? books.filter(book => {
          if (book.genre !== genre) return false
          if (book.pages >= pages) return false

          return true
        })
      : books.filter(book => book.pages <= pages)
  }, [genre, pages])

  const calculateAvailable = useCallback(
    (updatedView: Book[]) => {
      return matches.length - matches.filter(book => updatedView.includes(book)).length
    },
    [matches]
  )

  function handleAddView(book: Book) {
    const newView = [book, ...view]
    const updateAvailable = calculateAvailable(newView)

    localStorage.setItem('readlist', JSON.stringify(newView))
    localStorage.setItem('available', JSON.stringify(updateAvailable))

    setAvailable(updateAvailable)
    setView(newView)

    const bc = new BroadcastChannel('readlist')

    bc.postMessage(newView)
  }

  function handleRemoveView(ISBN: string) {
    const newView = view.filter(book => book.ISBN !== ISBN)
    const updateAvailable = calculateAvailable(newView)

    setView(newView)
    setAvailable(updateAvailable)

    localStorage.setItem('readlist', JSON.stringify(newView))
    localStorage.setItem('available', JSON.stringify(updateAvailable))

    const bc = new BroadcastChannel('readlist')

    bc.postMessage(newView)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newPages = Number(event.target.value)

    setPages(newPages)
  }

  useEffect(() => {
    const bc = new BroadcastChannel('readlist')

    bc.onmessage = event => {
      const newView = event.data
      const updateAvailable = calculateAvailable(newView)

      setView(newView)
      setAvailable(updateAvailable)

      localStorage.setItem('readlist', JSON.stringify(newView))
      localStorage.setItem('available', JSON.stringify(updateAvailable))
    }

    return () => bc.close()
  }, [view, calculateAvailable])

  useEffect(() => {
    const newView = localStorage.getItem('readlist')
    const newAvailable = localStorage.getItem('available')

    if (newView !== null && newAvailable !== null) {
      const parsedView = JSON.parse(newView)
      const parsedAvailable = JSON.parse(newAvailable)

      setView(parsedView)
      setAvailable(parsedAvailable)
    }
  }, [calculateAvailable])

  return (
    <div className="min-h-screen bg-slate-950 text-gray-50 ">
      <div className="mx-auto grid max-w-7xl grid-cols-3 grid-rows-[200px,1fr] gap-4 p-4">
        <header className="col-span-full w-full rounded border p-4">
          <p>{available} Libros disponibles</p>
          {view.length >= 1 && <p>{view.length} en la lista de lectura</p>}
          <form>
            <section>
              <label>Filtrar por páginas</label>
              <div>
                <label>{minPages}</label>
                <input
                  max={maxPages}
                  min={minPages}
                  type="range"
                  value={pages}
                  onChange={handleChange}
                />
                <label>{maxPages}</label>
                <p>{pages}</p>
              </div>
            </section>
            <section>
              <label>Filtrar por género</label>
              <div>
                <select className="text-black" onChange={event => setGenre(event.target.value)}>
                  <option className="selection:bg-blue-900" value="">
                    Todos
                  </option>
                  {genres.map((genre, index) => (
                    <option key={index} className="selection:bg-blue-900" value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </form>
        </header>
        <main className="col-span-2 rounded border p-4">
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-6">
            {matches.map((book: Book) => (
              <div key={book.ISBN} className="flex flex-col items-center gap-1">
                <img className="aspect-[4/6] w-3/4" src={book.cover} />
                <li className="w-3/4">{book.title}</li>
                <li>{book.pages}</li>
                {view.includes(book) ? (
                  <button
                    className="w-38 h-8 rounded-sm  bg-red-600 px-4 py-1 font-semibold text-red-950 transition-colors hover:bg-red-700"
                    onClick={() => handleRemoveView(book.ISBN)}
                  >
                    remove from list
                  </button>
                ) : (
                  <button
                    className="w-38 h-8 rounded-sm border px-4 py-1 transition-colors hover:border-slate-950 hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => handleAddView(book)}
                  >
                    add to reading list
                  </button>
                )}
              </div>
            ))}
          </ul>
        </main>
        <aside className="rounded border p-4 ">
          <ul className="grid gap-8">
            {view?.map((book: Book) => (
              <div key={book.ISBN} className="flex flex-col items-center gap-2">
                <img className="aspect-[4/6] w-3/4" src={book.cover} />
                <li className="w-3/4">{book.title}</li>
                <button
                  className="w-38 h-8 rounded-sm  bg-red-600 px-4 py-1 font-semibold text-red-950 transition-colors hover:bg-red-700"
                  onClick={() => handleRemoveView(book.ISBN)}
                >
                  remove from list
                </button>
              </div>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
