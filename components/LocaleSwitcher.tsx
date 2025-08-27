'use client';

import Link from 'next-intl/link';
import {usePathname} from 'next-intl/client';

export default function LocaleSwitcher() {
  const pathname = usePathname();
  return (
    <div>
      <Link href={pathname} locale="en">English</Link>
      {' | '}
      <Link href={pathname} locale="bm">Bahasa Melayu</Link>
    </div>
  );
}
