/**
 * Export some common classnames since tailwind purges them if they are
 * not explicitly used in the code base. Since we construct classnames
 * with clsx we add the classnames that are used.
 */
module.exports = {
  safelist: [
    'btn-primary',
    'btn-secondary',
    'btn-accent',
    'btn-info',
    'btn-success',
    'btn-warning',
    'btn-error',
    'btn-neutral',
  ],
}
