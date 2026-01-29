import {
  Text,
  type TextProps as RNTextProps,
  useWindowDimensions,
} from 'react-native';
import { cn } from '@/utils/cn';
import { type ReactNode } from 'react';

type TextType =
  | 'h1'
  | 'subtitle'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bloquote'
  | 'bodysmall'
  | 'bold'
  | 'error';

interface TextProps extends RNTextProps {
  type: TextType;
  className?: string;
  children: ReactNode;
}

// Phone styles (default)
const TEXT_TYPE_STYLES_PHONE: Record<TextType, string> = {
  h1: 'grow-0 self-stretch font-rubik text-[34px] leading-[37px] tracking-[0.01px]',
  subtitle: 'font-poppins text-base uppercase leading-[26px] tracking-[1px]',
  h2: 'grow-0 self-stretch font-rubik text-[30px] leading-[33px] tracking-[0.1px]',
  h3: 'grow-0 self-stretch font-rubik text-[24px] leading-[29px] tracking-[0.1px]',
  h4: 'grow-0 self-stretch font-rubik text-[22px] leading-[28px]',
  body: 'grow-0 self-stretch font-rubik text-lg leading-[24px] tracking-[0.1px]',
  bloquote: 'grow font-rubik text-[22px] italic leading-[32px]',
  bold: 'grow-0 self-stretch font-rubik font-bold text-[24px] leading-[30px]',
  bodysmall: 'font-rubik text-base leading-[24px] tracking-[0.1px]',
  error: 'font-rubik text-sm leading-[21px] tracking-[0.1px] text-red-500',
};

// Tablet styles (768px+)
const TEXT_TYPE_STYLES_TABLET: Record<TextType, string> = {
  h1: 'grow-0 self-auto font-poppins text-[60px] leading-[66px] tracking-[0.01px]',
  subtitle: 'font-poppins text-xl uppercase leading-[32px] tracking-[1px]',
  h2: 'grow-0 self-auto font-poppins text-[48px] leading-[68px] tracking-[0.1px]',
  h3: 'grow-0 self-auto font-poppins text-[36px] leading-[46px] tracking-[0.1px]',
  h4: 'grow-0 self-auto font-poppins text-[28px] leading-[36px]',
  body: 'grow-0 self-auto font-poppins text-[22px] leading-[30px] tracking-[0.1px]',
  bloquote: 'grow-0 font-poppins text-[28px] italic leading-[40px]',
  bold: 'grow-0 self-auto font-poppins font-bold text-[30px] leading-[38px]',
  bodysmall: 'font-poppins text-xl leading-[28px] tracking-[0.1px]',
  error: 'font-poppins text-lg leading-[27px] tracking-[0.1px] text-red-500',
};

export function CustomText({ type, className, children, ...props }: TextProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const styles = isTablet
    ? TEXT_TYPE_STYLES_TABLET[type]
    : TEXT_TYPE_STYLES_PHONE[type];
  const baseColor = type === 'error' ? '' : 'text-black';

  return (
    <Text
      className={cn(styles, baseColor, className)}
      allowFontScaling={false}
      {...props}
    >
      {children}
    </Text>
  );
}
