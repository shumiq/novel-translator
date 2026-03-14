export const isJapanese = (text: string) =>
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);

export const isThai = (text: string) => /\p{Script=Thai}/u.test(text);

export const isEnglish = (text: string) => {
  return (
    text
      .replaceAll(/\p{Script=Latin}{3,}/gu, "this-is-english")
      .split("this-is-english").length > 100
  );
};
