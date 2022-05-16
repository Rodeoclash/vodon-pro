import {
  useMatch,
  useResolvedPath,
  Link as RouterLink,
} from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import { Link } from '@chakra-ui/react';

export default function NavLink({ children, to, ...props }: LinkProps) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <div>
      <Link
        as={RouterLink}
        backgroundColor={match ? 'whiteAlpha.400' : 'none'}
        to={to}
        px="4"
        py="2"
        borderRadius="2xl"
        ml="4"
        _focus={{ boxShadow: 'none' }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}
