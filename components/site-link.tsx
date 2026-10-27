import type { AnchorHTMLAttributes } from 'react';

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean };

/** Use document navigation so links also work before hydration and in embedded browsers. */
export default function SiteLink({ prefetch: _prefetch, ...props }: SiteLinkProps) {
  return <a {...props} />;
}
