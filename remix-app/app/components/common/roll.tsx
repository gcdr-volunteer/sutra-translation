import { LinkBox, Card, CardHeader, CardBody, Heading, LinkOverlay, Text } from '@chakra-ui/react';
import { Link } from '@remix-run/react';
interface RollProps {
  slug: string;
  roll_num: string;
  title: string;
}
export function Roll(props: RollProps) {
  const { slug, roll_num, title } = props;
  return (
    <LinkBox as="article" key={slug}>
      <Card
        background="secondary.500"
        w={200}
        borderRadius={12}
        boxShadow="0 12px 12px 0 rgba(0, 0, 0, 0.05)"
      >
        <CardHeader>
          <Heading size="lg">{roll_num}</Heading>
        </CardHeader>
        <CardBody>
          <LinkOverlay as={Link} to={slug}>
            <Text>{title}</Text>
          </LinkOverlay>
        </CardBody>
      </Card>
    </LinkBox>
  );
}
