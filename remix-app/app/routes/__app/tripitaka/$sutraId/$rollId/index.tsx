import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { Text, IconButton, Flex, Checkbox, useBoolean } from '@chakra-ui/react';
import { useRef } from 'react';
import type { MutableRefObject } from 'react';
import { Paragraph } from '~/components/common/paragraph';
import { FiEdit } from 'react-icons/fi';

export const loader = async ({ params }: LoaderArgs) => {
  return json({
    footnotes: [],
    paragraphs: [
      {
        num: '0001',
        finish: true,
        origin:
          '蓋聞：「造化權輿之首，天道未分；龜龍繫象之初，人文始著。雖萬八千歲，同臨有截之區；七十二君，詎識無邊之義。」由是人迷四忍，輪迴於六趣之中；家纏五蓋，沒溺於三塗之下。及夫鷲巖西峙，象駕東驅，慧日法王超四大而高視，中天調御越十地以居尊，包括鐵圍，延促沙劫。其為體也，則不生不滅；其為相也，則無去無來。念處、正勤，三十七品為其行；慈、悲、喜、捨，四無量法運其心。方便之力難思，圓對之機多緒，混大空而為量，豈算數之能窮？入纖芥之微區，匪名言之可述，無得而稱者，其唯大覺歟！',
        target:
          'Aliquam commodo fringilla neque, sit amet condimentum risus commodo in. Quisque porta mi arcu, eget condimentum nunc mollis ac. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed ut cursus nulla. Curabitur ut nunc in est sollicitudin feugiat non at odio. Nullam in accumsan purus, non congue risus. Suspendisse hendrerit non eros ac mattis. Maecenas ornare pellentesque augue non venenatis. Sed tincidunt blandit nibh vel rhoncus. Etiam vitae sagittis risus. Praesent in nisl urna. Suspendisse pharetra eros ut diam malesuada gravida. Aliquam ornare scelerisque enim, sit amet ultricies urna consectetur non. Maecenas in odio malesuada, sagittis erat a, suscipit eros. Proin sodales rhoncus metus, sed placerat ipsum consequat a. Nam quis accumsan arcu. Quisque egestas fringilla lectus, interdum vehicula quam porta ac. Integer magna ligula, porta quis elementum eget, ornare ac purus. Duis lobortis euismod neque sed pellentesque.',
        comments: [
          {
            content: 'Quisque porta mi arcu, eget condimentum',
            comment:
              'NMorbi varius nisl eget nisl eleifend semper. Nulla facilisi. Donec ultrices fermentum ligula vel porttitor. Ut quis ipsum efficitur, feugiat augue non, molestie neque. Mauris quis efficitur sapien. Cras vehicula euismod ornare. Nullam vel arcu condimentum felis facilisis sollicitudin. Nulla mollis malesuada vehicula. Sed lectus libero, varius sit amet vulputate sed, congue ut elit. Donec non molestie arcu. Phasellus ac metus ullamcorper, pellentesque ipsum quis, aliquet purus. Maecenas pulvinar dui at auctor dictum. Suspendisse iaculis ultrices laoreet.',
          },
          {
            content: 'nisl eleifend semper',
            comment:
              'NMorbi varius nisl eget nisl eleifend semper. Nulla facilisi. Donec ultrices fermentum ligula vel porttitor. Ut quis ipsum efficitur, feugiat augue non, molestie neque. Mauris quis efficitur sapien. Cras vehicula euismod ornare. Nullam vel arcu condimentum felis facilisis sollicitudin. Nulla mollis malesuada vehicula. Sed lectus libero, varius sit amet vulputate sed, congue ut elit. Donec non molestie arcu. Phasellus ac metus ullamcorper, pellentesque ipsum quis, aliquet purus. Maecenas pulvinar dui at auctor dictum. Suspendisse iaculis ultrices laoreet.',
          },
        ],
      },
      {
        num: '0002',
        finish: true,
        origin:
          '朕曩劫植因，叨承佛記。金[4]仙降旨，大雲之偈先彰；玉扆披祥，寶雨之文後及。加以積善餘慶，俯集微躬，遂得地平天成，河清海晏。殊禎絕瑞，既日至而月書；貝[5]牒靈文，亦時臻而歲洽。逾海越漠，獻賝之禮備焉；架險航深，重譯之[6]辭罄矣。',
        target:
          'Nam posuere urna eget purus suscipit, id gravida nisi malesuada. Maecenas consequat laoreet tellus sed suscipit. Vivamus iaculis vehicula suscipit. Pellentesque ex velit, luctus quis sagittis eget, pellentesque vel libero. Ut interdum ultricies rutrum. Aenean ac sagittis ante, at pellentesque leo. Praesent rutrum ac neque nec euismod. Nulla ex elit, vehicula ut metus ut, lobortis ornare ex.',
        comments: [
          {
            content: 'posuere urna eget',
            comment:
              'Morbi in iaculis lacus, vel posuere purus. Nulla interdum hendrerit mauris, sit amet cursus odio laoreet ac. Vestibulum et nibh at eros pulvinar pellentesque in et mauris. In nec lacinia nisi. Quisque vulputate nec velit sed mollis. Vivamus consectetur dolor sit amet interdum efficitur. Aenean sollicitudin sollicitudin ipsum a condimentum. Donec sagittis ultrices ligula posuere placerat. Morbi luctus eu lorem sed pellentesque. Vivamus augue nulla, gravida a vulputate quis',
          },
        ],
      },
      {
        num: '0003',
        finish: true,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target:
          'Integer pulvinar nisi diam, quis aliquet turpis sodales eget. Duis sagittis orci quam, sit amet mattis nibh vehicula vitae. Quisque scelerisque blandit est ut sagittis. Pellentesque pretium enim non nisi hendrerit facilisis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id iaculis mauris. Suspendisse quis tortor ante. Sed pulvinar lorem a dolor pretium rutrum. Ut neque justo, rutrum a ante sed, varius varius lectus. Phasellus in risus pharetra tortor tincidunt imperdiet. Cras condimentum nunc diam, non lacinia libero tristique quis. Praesent lorem massa, rhoncus sed gravida sed, tincidunt a risus. Nulla facilisi.',
        comments: [],
      },
      {
        num: '0004',
        finish: true,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target:
          'Fusce eu sagittis risus. Donec rutrum, massa ut rhoncus blandit, ipsum tellus imperdiet eros, finibus malesuada elit ipsum sed nisi. Ut iaculis purus justo, quis fermentum lorem cursus id. Mauris vel nibh eget nibh luctus bibendum. Etiam vestibulum convallis ornare. Proin in maximus neque. Sed eleifend interdum erat, sed varius erat volutpat finibus. Donec laoreet tristique iaculis. Fusce aliquam dapibus diam, a scelerisque est vehicula vel. Pellentesque at congue nibh, sit amet aliquam diam.',
        comments: [],
      },
      {
        num: '0005',
        finish: true,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target:
          'Nam euismod purus ut risus varius, at consectetur mi bibendum. Sed condimentum sit amet leo eget vestibulum. Nunc molestie ante in diam rhoncus, sit amet fermentum arcu imperdiet. Mauris in augue elementum, euismod purus at, pulvinar ex. Ut tristique tellus et facilisis tincidunt. Nam molestie et nibh in pellentesque. Etiam eu auctor risus. Duis sodales orci sit amet odio lacinia, nec efficitur sapien feugiat. Etiam non ultrices mi, id blandit libero.',
        comments: [],
      },
      {
        num: '0006',
        finish: true,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target:
          'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ornare semper metus eu interdum. Maecenas fermentum efficitur velit, sed faucibus tortor euismod sed. Pellentesque blandit ligula id posuere semper. Pellentesque nec suscipit orci. Nullam ut tempus turpis. Vestibulum et molestie mauris. In cursus neque ut risus vulputate rhoncus. Vestibulum blandit, odio accumsan pulvinar porta, ipsum ipsum faucibus est, vitae egestas libero erat vel ipsum. Vestibulum posuere mauris et dui consectetur varius. Pellentesque mattis orci id enim aliquam iaculis. Vestibulum rhoncus faucibus velit, tempor ultricies odio convallis non.',
        comments: [],
      },
      {
        num: '0007',
        finish: false,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target: '',
        comments: [],
      },
      {
        num: '0008',
        finish: false,
        origin:
          '《大方廣佛華嚴經》者，斯乃諸佛之密藏，如來之性海。視之者，莫識其指歸；挹之者，罕測其涯際。有學、無學，志絕窺覦；二乘、三乘，寧希聽受。最勝種智，莊嚴之迹既隆；普賢、文殊，願行之因斯滿。一句之內，包法界之無邊；一毫之中，置剎土而非隘。摩竭陀國，肇興妙會之緣；普光法堂，爰敷寂滅之理。緬惟奧義，譯在晉朝；時逾六代，年將四百。[7]然圓一部之典，纔獲三萬餘言，唯啟半珠，未窺全寶。朕聞其梵本，先在于闐國中，遣使奉迎，近方至此。既覩百千之妙頌，乃披十萬之正文。粵以證聖元年，歲次乙未，月旅沽洗，朔惟戊申，以其十四日辛酉，於大遍空寺，親受筆削，敬譯斯經。遂得甘露流津，預夢庚申之夕；膏雨灑潤，後覃壬戌之辰。式開實相之門，還符一味之澤。以聖曆二年，歲次[A1]己亥，十月壬午朔，八日[A2]己丑，繕寫畢功；添性海之波瀾，廓法界之疆域。大乘頓教，普被於無窮；方廣真[8]筌，遐該於有識。豈謂後五百歲，忽奉金口之言；娑婆境中，俄啟珠函之祕。所冀：闡揚沙界，宣暢塵區；並兩曜而長懸，彌十方而永布。一窺寶偈，慶溢心靈；三復幽宗，喜盈身意。雖則無說無示，理符不二之門；[9]然而因言顯言，方闡大千之義。輒申鄙作，爰題序云。',
        target: '',
        comments: [],
      },
    ],
  });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const entryData = Object.fromEntries(formData.entries());
  return json({});
};
export default function RollRoute() {
  const { paragraphs, footnotes } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const checkedParagraphs = useRef(new Set<number>());
  const paragraphsComp = paragraphs.map((paragraph, index) => (
    <Paragraph
      {...paragraph}
      key={paragraph.num}
      index={index}
      checkedParagraphs={checkedParagraphs}
      finish={false}
      footnotes={footnotes}
    />
  ));
  if (paragraphs.length) {
    return (
      <Flex
        w="100%"
        flexDir="column"
        justifyContent="flex-start"
        alignItems="center"
        gap={4}
        mt={10}
      >
        {paragraphsComp}
        <IconButton
          borderRadius={'50%'}
          w={12}
          h={12}
          pos={'fixed'}
          bottom={8}
          right={8}
          icon={<FiEdit />}
          aria-label="edit roll"
          colorScheme={'iconButton'}
          onClick={() => {
            navigate(`staging`, {
              state: {
                paragraphs: Array.from(checkedParagraphs.current)
                  .sort()
                  .map((index) => paragraphs[index]),
              },
            });
          }}
        />
      </Flex>
    );
  }
  return <div>Roll</div>;
}
