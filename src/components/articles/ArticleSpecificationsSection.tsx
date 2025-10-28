import { View } from 'react-native';
// import { InfoIcon } from '@/icons';
// import { ToolTip } from '@/components/tooltip';
import { ArticleSpecificationItem } from './ArticleSpecificationItem';
import {
  Article,
  ArticleCategories,
  ArticleCategoriesConst,
  Lang,
} from '@/types/types';
import { Translations } from '@/i18n';
import {
  ART_TYPES_LABELS,
  ARTICLE_BRANDS_LABELS,
  ARTICLE_COLORS_LABELS,
  ARTICLE_MATERIALS_LABELS,
  ARTICLE_SMELL_LABELS,
  ARTICLE_STATE_LABELS,
  BOX_MATERIALS_LABELS,
  STRAP_MATERIALS_LABELS,
  WATCH_MOVEMENTS_LABELS,
} from '@/constants';
import { formatMeasures } from '@/utils/formatMeasures';
import { isRecognizedBrand } from '@/utils/isRecognizedBrand';

type ArticleSpecificationsSectionProps = {
  article: Article;
  articleLang: Translations['es']['screens']['article'];
  lang: Lang;
  articleCategory: ArticleCategories;
  liveAuctoView?: boolean;
};

export function ArticleSpecificationsSection({
  article,
  articleLang,
  lang,
  articleCategory,
  liveAuctoView = false,
}: ArticleSpecificationsSectionProps) {
  // build "12 x 5 x 3" style measures
  const measures = formatMeasures({
    width: article.width,
    height: article.height,
    length: article.length,
  });

  const recognizedBrand = isRecognizedBrand(article.brand ?? '');

  return (
    <View className={liveAuctoView ? 'w-full px-0' : 'w-full px-0'}>
      {/* Model */}
      <View className='mb-2'>
        <ArticleSpecificationItem
          label={articleLang.model}
          value={article.title}
        />
      </View>

      {/* Brand (skip for ART category) */}
      {articleCategory !== ArticleCategoriesConst.ART && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.brand}
            value={
              recognizedBrand
                ? ARTICLE_BRANDS_LABELS[
                    article.brand as keyof typeof ARTICLE_BRANDS_LABELS
                  ]
                : (article.brand ?? '')
            }
          />
        </View>
      )}

      {/* Material (JEWELRY || BAG) */}
      {(articleCategory === ArticleCategoriesConst.JEWERLY ||
        articleCategory === ArticleCategoriesConst.BAG) && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.material}
            value={
              article.material
                ? ARTICLE_MATERIALS_LABELS[lang][
                    article.material as keyof (typeof ARTICLE_MATERIALS_LABELS)[typeof lang]
                  ]
                : '-'
            }
          />
        </View>
      )}

      {/* Condition (with tooltip on web) */}
      <View className='mb-2'>
        <ArticleSpecificationItem
          label={articleLang.condition}
          value={
            article.state ? ARTICLE_STATE_LABELS[lang][article.state] : '-'
          }
          // tooltip on web:
          // tooltip={
          //   <ToolTip
          //     trigger={
          //       <InfoIcon className="ml-1 h-4 w-4 text-cinnabar" />
          //     }
          //   >
          //     {
          //       ARTICLE_STATE_DESCRIPTION[lang][
          //         article.state as keyof (typeof ARTICLE_STATE_DESCRIPTION)['es']
          //       ]
          //     }
          //   </ToolTip>
          // }
          //
          // On mobile, you'll likely show an (i) button that opens a modal with
          // ARTICLE_STATE_DESCRIPTION[lang][article.state] like we did with price breakdown.
        />
      </View>

      {/* ART-only fields */}
      {articleCategory === ArticleCategoriesConst.ART && (
        <>
          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.artType}
              value={
                article.artType
                  ? ART_TYPES_LABELS[lang][
                      article.artType as keyof (typeof ART_TYPES_LABELS)[typeof lang]
                    ]
                  : '-'
              }
            />
          </View>

          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.weight}
              value={article.weight ? `${article.weight}kg` : '-'}
            />
          </View>
        </>
      )}

      {/* Measures (ART or BAG) */}
      {(articleCategory === ArticleCategoriesConst.ART ||
        articleCategory === ArticleCategoriesConst.BAG) && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.measures}
            value={measures ? measures + 'cm' : '-'}
          />
        </View>
      )}

      {/* WATCH-only fields */}
      {articleCategory === ArticleCategoriesConst.WATCH && (
        <>
          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.faceDiameter}
              value={article.faceDiameter ? `${article.faceDiameter}cm` : '-'}
            />
          </View>

          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.movement}
              value={
                article.movement
                  ? WATCH_MOVEMENTS_LABELS[lang][
                      article.movement as keyof (typeof WATCH_MOVEMENTS_LABELS)[typeof lang]
                    ]
                  : '-'
              }
            />
          </View>

          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.strapMaterial}
              value={
                article.strapMaterial
                  ? STRAP_MATERIALS_LABELS[lang][
                      article.strapMaterial as keyof (typeof STRAP_MATERIALS_LABELS)[typeof lang]
                    ]
                  : '-'
              }
            />
          </View>

          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.boxMaterial}
              value={
                article.boxMaterial
                  ? BOX_MATERIALS_LABELS[lang][
                      article.boxMaterial as keyof (typeof BOX_MATERIALS_LABELS)[typeof lang]
                    ]
                  : '-'
              }
            />
          </View>

          <View className='mb-2'>
            <ArticleSpecificationItem
              label={articleLang.year}
              value={article.year?.toString() || '-'}
            />
          </View>
        </>
      )}

      {/* Color (not for ART) */}
      {articleCategory !== ArticleCategoriesConst.ART && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.color}
            value={
              article.color
                ? ARTICLE_COLORS_LABELS[lang][
                    article.color as keyof (typeof ARTICLE_COLORS_LABELS)[typeof lang]
                  ]
                : '-'
            }
          />
        </View>
      )}

      {/* Size (JEWELRY) */}
      {articleCategory === ArticleCategoriesConst.JEWERLY && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.size}
            value={article.size ? `${article.size}cm` : '-'}
          />
        </View>
      )}

      {/* Smell (BAG) */}
      {articleCategory === ArticleCategoriesConst.BAG && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.smell}
            value={
              article.smell ? ARTICLE_SMELL_LABELS[lang][article.smell] : '-'
            }
          />
        </View>
      )}

      {/* Documentation (JEWELRY or WATCH) */}
      {(articleCategory === ArticleCategoriesConst.JEWERLY ||
        articleCategory === ArticleCategoriesConst.WATCH) && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.documentation}
            value={article.documentation ? articleLang.yes : articleLang.no}
          />
        </View>
      )}

      {/* Box (WATCH) */}
      {articleCategory === ArticleCategoriesConst.WATCH && (
        <View className='mb-2'>
          <ArticleSpecificationItem
            label={articleLang.box}
            value={article.box ? articleLang.yes : articleLang.no}
          />
        </View>
      )}

      {/* Code number (always) */}
      <View className='mb-2'>
        <ArticleSpecificationItem
          label={articleLang.codeNumber}
          value={article.codeNumber || '-'}
        />
      </View>
    </View>
  );
}
