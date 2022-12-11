import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  LinkOverlay,
  LinkBox,
  Text,
  Box,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useLocation, Link } from '@remix-run/react';
export const BreadCrumb = () => {
  const location = useLocation();
  const tempPath = location?.pathname;
  const names = ['TRIPITAKA', 'SUTRA', 'ROLL', 'STAGING'];

  const breadcrumbComp = tempPath
    .split('/')
    .filter(Boolean)
    .map((_, index, arr) => {
      const href = `/${arr.slice(0, index + 1).join('/')}`;
      return (
        <BreadcrumbItem key={href}>
          <LinkBox as={'article'}>
            <Link to={href}>
              <Text as="b">{names[index]}</Text>
            </Link>
          </LinkBox>
        </BreadcrumbItem>
      );
    });

  return (
    <Flex>
      <Breadcrumb spacing={2} separator={<ChevronRightIcon color="gray.500" />}>
        {breadcrumbComp}
      </Breadcrumb>
    </Flex>
  );
};
