import {
  NICKNAME_COLOR_OPTIONS,
  generateNicknameColor,
  useUserColorsStore,
} from '@/stores/user-colors-store';

export { NICKNAME_COLOR_OPTIONS, generateNicknameColor };

export const useUserColor = () => {
  const myColor = useUserColorsStore((state) => state.myColor);
  const setMyColor = useUserColorsStore((state) => state.setMyColor);
  const resetMyColorToAuto = useUserColorsStore(
    (state) => state.resetMyColorToAuto,
  );
  const isMyColorAuto = useUserColorsStore((state) => state.isMyColorAuto);
  const getEffectiveColor = useUserColorsStore(
    (state) => state.getEffectiveColor,
  );

  return {
    selectedColor: myColor,
    saveColor: setMyColor,
    resetToAuto: resetMyColorToAuto,
    isAutoMode: isMyColorAuto(),
    colorOptions: NICKNAME_COLOR_OPTIONS,
    getEffectiveColor,
    generateNicknameColor,
  };
};
