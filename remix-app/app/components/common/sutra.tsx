import {
  LinkBox,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Heading,
  Text,
  LinkOverlay,
  CardFooter,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
interface SutraProps {
  slug: string;
  category: string;
  title: string;
  translator: string;
}
export function Sutra(props: SutraProps) {
  const { slug, category, title, translator } = props;
  return (
    <LinkBox as="article" key={slug}>
      <Card
        background="secondary.500"
        w={300}
        h={250}
        borderRadius={12}
        boxShadow="0 12px 12px 0 rgba(0, 0, 0, 0.05)"
      >
        <CardHeader>
          <Heading size="lg">
            <Badge colorScheme="green" variant="solid">
              <Text fontSize={'md'}>{category}</Text>
            </Badge>
          </Heading>
        </CardHeader>
        <CardBody>
          <LinkOverlay as={Link} to={slug}>
            <Text as="b" fontSize="3xl">
              {title}
            </Text>
          </LinkOverlay>
        </CardBody>
        <CardFooter>
          <Text>{translator}</Text>
        </CardFooter>
      </Card>
    </LinkBox>
  );
}
