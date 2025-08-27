export interface Borrow {
  id?: number;
  bookId: number;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  fine: number;
}
