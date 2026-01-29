import { Text, type TextProps as RNTextProps } from 'react-native';
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

const TEXT_TYPE_STYLES: Record<TextType, string> = {
  h1: 'grow-0 self-stretch font-rubik text-[34px] leading-[37px] tracking-[0.01px] md:self-auto md:font-poppins md:text-[60px] md:leading-[66px]',
  subtitle:
    'font-poppins text-base uppercase leading-[26px] tracking-[1px] md:text-xl md:leading-[32px]',
  h2: 'grow-0 self-stretch font-rubik text-[30px] leading-[33px] tracking-[0.1px] md:self-auto md:font-poppins md:text-[48px] md:leading-[68px]',
  h3: 'grow-0 self-stretch font-rubik text-[24px] leading-[29px] tracking-[0.1px] md:self-auto md:font-poppins md:text-[36px] md:leading-[46px]',
  h4: 'grow-0 self-stretch font-rubik text-[22px] leading-[28px] md:self-auto md:font-poppins md:text-[28px] md:leading-[36px]',
  body: 'grow-0 self-stretch font-rubik text-lg leading-[24px] tracking-[0.1px] md:self-auto md:font-poppins md:text-[22px] md:leading-[30px]',
  bloquote:
    'grow font-rubik text-[22px] italic leading-[32px] md:grow-0 md:font-poppins md:text-[28px] md:leading-[40px]',
  bold: 'grow-0 self-stretch font-rubik font-bold text-[24px] leading-[30px] md:self-auto md:font-poppins md:text-[30px] md:leading-[38px]',
  bodysmall:
    'font-rubik text-base leading-[24px] tracking-[0.1px] md:font-poppins md:text-xl md:leading-[28px]',
  error:
    'font-rubik text-sm leading-[21px] tracking-[0.1px] text-red-500 md:font-poppins md:text-lg md:leading-[27px]',
};

export function CustomText({ type, className, children, ...props }: TextProps) {
  const baseColor = type === 'error' ? '' : 'text-black';

  return (
    <Text
      className={cn(TEXT_TYPE_STYLES[type], baseColor, className)}
      allowFontScaling={false}
      {...props}
    >
      {children}
    </Text>
  );
}
