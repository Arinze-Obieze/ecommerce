'use client';

import { FiCheck } from 'react-icons/fi';
import { TbShoppingCartPlus } from 'react-icons/tb';

export default function QuickAddButton({
  cartState,
  onClick,
  fullWidth = false,
  label,
  disabled = false,
}) {
  const idleLabel = label || (fullWidth ? 'Add to Cart' : 'Add');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`zova-btn zova-btn-primary inline-flex items-center justify-center gap-1.5 rounded-full bg-(--zova-primary-action) px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(46,100,23,0.16)] transition-all duration-150 hover:bg-(--zova-primary-action-hover) disabled:cursor-not-allowed disabled:bg-[#9bb394] disabled:shadow-none ${fullWidth ? 'flex-1 rounded-xl py-3 text-sm font-bold' : 'shrink-0 px-[0.9rem] py-[0.68rem]'}`}
    >
      {cartState === 'added' ? (
        <>
          <FiCheck className={fullWidth ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
          <span className={fullWidth ? '' : 'hidden sm:inline'}>{fullWidth ? 'Added to Cart' : 'Added'}</span>
        </>
      ) : (
        <>
          <TbShoppingCartPlus className={fullWidth ? 'h-[18px] w-[18px]' : 'h-4 w-4'} strokeWidth={2} />
          <span className={fullWidth ? '' : 'hidden sm:inline'}>{idleLabel}</span>
        </>
      )}
    </button>
  );
}
