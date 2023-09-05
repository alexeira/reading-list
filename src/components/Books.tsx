import { Book } from '../App'

interface Props {
  books: Book[]
}

export const Books: React.FC<Props> = ({ books }) => {
  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-6">
      {books.map((book: Book) => (
        <div key={book.ISBN} className="flex flex-col items-center">
          <img className="aspect-[4/6] w-3/4" src={book.cover} />
          <li>{book.title}</li>
        </div>
      ))}
    </ul>
  )
}
