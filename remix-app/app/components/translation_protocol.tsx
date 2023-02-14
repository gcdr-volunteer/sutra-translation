import { Box, Heading, ListItem, OrderedList, SimpleGrid, Text } from '@chakra-ui/react';

export const TranslationProtocol = () => {
  return (
    <Box>
      <Heading textAlign={'center'} as='h3' size='lg'>
        The Eight Guidelines for Translators and Volunteers 译经八项基本守则
      </Heading>
      <SimpleGrid columns={1} spacing={4}>
        <OrderedList>
          <ListItem>
            <Text>
              Translators and volunteers must free themselves from the motives of personal fame and
              reputation.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must cultivate an attitude free from arrogance and conceit.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must refrain from aggrandizing themselves and denigrating
              others.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must not establish themselves as the standard of
              correctness and suppress the work of others with their fault-finding.
            </Text>
          </ListItem>
          <ListItem>
            <Text>Translators and volunteers must take the Buddha-mind as their own mind.</Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must use the wisdom of the Selective Dharma Eye to
              determine true principles.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must request the Elder Virtuous Ones of the ten directions
              to certify their translations.
            </Text>
          </ListItem>
          <ListItem>
            <Text>
              Translators and volunteers must endeavor to propagate the teachings by printing sutras
              (scriptures of what was spoken by the Buddha), shastras (commentarial texts written by
              masters of the teachings), and vinaya texts (all the precept teachings for monastics
              and laypeople) when the translations are certified as being correct.
            </Text>
          </ListItem>
        </OrderedList>
        <OrderedList>
          <ListItem>
            <Text>從事翻譯工作者不得抱有個人的名利。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者不得貢高我慢，必須以虔誠恭敬的態度來工作。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者不得自贊毀他。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者不得自以為是，對他人作品吹毛求疵。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者必須以佛心為己心。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者必須運用擇法眼來辨別正確的道理。</Text>
          </ListItem>
          <ListItem>
            <Text>從事翻譯工作者必須懇請大德長老來印證其翻譯。</Text>
          </ListItem>
          <ListItem>
            <Text>
              從事翻譯工作者之作品在獲得印證之後，必須努力弘揚流通經、律、論，以及佛書，以光大佛教。
            </Text>
          </ListItem>
        </OrderedList>
      </SimpleGrid>
    </Box>
  );
};
