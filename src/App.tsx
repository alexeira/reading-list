import { useState } from 'react'

import mock from '../books.json'

import { Books } from './components/Books'

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

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-50 ">
      <div className="mx-auto grid max-w-7xl grid-cols-3 grid-rows-[200px,1fr] gap-4 p-4">
        <header className="col-span-full w-full rounded border p-4">
          <p>Libros disponibles</p>
          <form>
            <section>
              <label>Filtrar por páginas</label>
              <input type="range" />
            </section>
            <section>
              <label>Filtrar por género</label>
              <select>
                <option value="todas">Todos</option>
              </select>
            </section>
          </form>
        </header>
        <main className=" col-span-2 rounded border p-4">
          <Books books={books} />
        </main>
        <aside className="rounded border p-4">lista de lectura</aside>
      </div>
    </div>
  )
}
