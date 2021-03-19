import { Constructor, MixinFunction, MixinReturnValue } from '..';

export function mixin<T extends Constructor, M extends MixinFunction<T, any>[]>(
  Base: T,
  ...mixins: M
): MixinReturnValue<M> {
  return mixins.reduce((mix, applyMixin) => applyMixin(mix), Base) as MixinReturnValue<M>;
}
