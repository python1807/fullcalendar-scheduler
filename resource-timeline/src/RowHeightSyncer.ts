import { PositionCache, findElements } from '@fullcalendar/core'


/*
TODO: optimizations like neverexpand (a certain hContainer)
*/
export default class RowHeightSyncer {

  public rowPositions: PositionCache
  public hContainersTrs: HTMLElement[][]


  // TODO: break up until read/write pieces
  // TODO: consider rowSpan
  sync(hContainers: HTMLElement[]) {
    let hContainersTrs: HTMLElement[][] = []
    let rowCnt = 0

    for (let hContainer of hContainers) {
      let trs = findElements(hContainer, 'tr')
      hContainersTrs.push(trs)

      if (trs.length > rowCnt) {
        rowCnt = trs.length
      }
    }

    let rowHeights: number[] = []

    for (let row = 0; row < rowCnt; row++) {
      let bestHeight = 0

      for (let i = 0; i < hContainersTrs.length; i++) {
        let tr = hContainersTrs[i][row]

        if (tr) { // in case an uneven number
          let trTop = tr.getBoundingClientRect().top
          let innerDivs = findElements(tr, 'td > *, th > *')

          for (let innerDiv of innerDivs) {
            let tryHeight = innerDiv.getBoundingClientRect().bottom - trTop

            if (tryHeight > bestHeight) {
              bestHeight = tryHeight
            }
          }
        }
      }

      rowHeights.push(bestHeight)

      for (let trs of hContainersTrs) {
        let trCnt = trs.length
        let row

        for (row = 0; row < trCnt - 1; row++) {
          trs[row].style.height = rowHeights[row] + 'px'
        }

        let lastHeight = 0

        for (; row < rowCnt; row++) {
          lastHeight += rowHeights[row]
        }

        if (trCnt > 0) {
          trs[trCnt - 1].style.height = lastHeight + 'px'
        }
      }
    }

    this.hContainersTrs = hContainersTrs

    this.rowPositions = new PositionCache(
      hContainers[0],
      hContainersTrs[0],
      false,
      true // isVertical
    )

    this.rowPositions.build()
  }

}
