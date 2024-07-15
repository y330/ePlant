import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Space } from 'react-zoomable-ui'

import GeneticElement from '@eplant/GeneticElement'
import { useActiveGeneId, useGeneticElements } from '@eplant/state'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'

import { View, ViewProps } from '../../View'

import ChromosomeView from './Viewer/Viewer'
import { ChromosomeIcon } from './icons'
import {
  ChromosomeList,
  ChromosomesResponseObj,
  ChromosomeViewerAction,
  ChromosomeViewerData,
  ChromosomeViewerState,
  Transform,
} from './types'
import ZoomControls from './ZoomControls'
import SnackbarContent from '@mui/material/SnackbarContent'
import CircularProgress from '@mui/material/CircularProgress'

const ChromosomeViewer: View<
  ChromosomeViewerData,
  ChromosomeViewerState,
  ChromosomeViewerAction
> = {
  name: 'Chromosome Viewer',
  id: 'chromosome-viewer',
  getInitialState(): ChromosomeViewerState {
    return {
      transform: {
        dx: 300,
        dy: 150,
        dZoom: 0.7,
      },
      species: 'Arabidopsis_thaliana',
    }
  },

  async getInitialData(
    gene: GeneticElement | null,
    loadEvent: (progress: number) => void
  ) {
    let chromosomeViewData: ChromosomeList = [
      {
        id: 'Chr1',
        name: 'Chr 1',
        size: 30427671,
        centromeres: [
          {
            id: 'CEN1',
            start: 15086046,
            end: 15087045,
          },
        ],
      },
    ]

    const poplar = false
    const species = poplar ? 'Populus_trichocarpa' : 'Arabidopsis_thaliana'
    const url = `https://bar.utoronto.ca/eplant${
      poplar ? '_poplar' : ''
    }/cgi-bin/chromosomeinfo.cgi?species=${species}`

    // const species = 'Populus_trichocarpa'
    // const url = `https://bar.utoronto.ca/eplant_poplar/cgi-bin/chromosomeinfo.cgi?species=${species}`
    chromosomeViewData = await fetch(url)
      .then(async (response) => {
        return response.json()
      })
      .then((responseObj: ChromosomesResponseObj) => responseObj['chromosomes'])

    return {
      activeView: ChromosomeViewer.id,
      viewData: chromosomeViewData,
      transform: {
        dx: 0,
        dy: 0,
        dZoom: 1,
      },
      species: species,
    }
  },
  component({
    activeData,
    state,
    dispatch,
    geneticElement,
  }: ViewProps<
    ChromosomeViewerData,
    ChromosomeViewerState,
    ChromosomeViewerAction
  >) {
    const spaceRef = React.useRef<Space | null>(null)
    const [messageOpen, setMessageOpen] = useState(true)
    useEffect(() => {
      spaceRef.current?.viewPort?.camera.moveBy(0, 0, 0.1)

      setTimeout(() => {
        // refresh the ui to render gene annotations automatically
        spaceRef.current?.viewPort?.camera.moveBy(0, 0, -0.1)
      }, 1000)
    }, [])
    const handleClose = () => {
      setMessageOpen(false)
    }

    return (
      <Box sx={{ flexGrow: 1 }}>
        {/* ZOOM CONTROLS */}
        <ZoomControls spaceRef={spaceRef} scale={state.transform.dZoom} />
        {/* CHROMOSOME VIEWER */}
        <Space
          ref={spaceRef}
          onCreate={(vp) => {
            vp.camera.recenter(
              state.transform.dx,
              state.transform.dy,
              state.transform.dZoom
            )
            vp.setBounds({
              x: [-650, 1300],
              y: [-450, 815],
              zoom: [0.05, 1000 - 0.3],
            })
          }}
          onUpdated={(vp) => {
            const transform: Transform = {
              dx: vp.centerX,
              dy: vp.centerY,
              dZoom: vp.zoomFactor,
            }
            dispatch({
              type: 'set-transform',
              transform,
            })
          }}
        >
          <ChromosomeView
            chromosomes={activeData.viewData}
            scale={state.transform.dZoom}
            species={state.species}
          ></ChromosomeView>
        </Space>
        <Snackbar
          open={messageOpen}
          autoHideDuration={2500}
          onClose={handleClose}
        >
          <SnackbarContent
            sx={(theme) => ({
              backgroundColor: theme.palette.background.transparentOverlay,
              color: theme.palette.secondary.contrastText,
            })}
            message={
              <span id='client-snackbar'>
                Please allow a brief moment for gene annotations to be processed
                &nbsp;
                <CircularProgress size={12} />
              </span>
            }
          />
        </Snackbar>
      </Box>
    )
  },
  actions: [],
  reducer: (state, action) => {
    switch (action.type) {
      case 'set-transform':
        return {
          ...state,
          transform: action.transform,
        }
      default:
        return state
    }
  },
  icon: () => <ChromosomeIcon />,
  description: 'Chromosome Viewer.',
  citation() {
    return (
      <div>
        This image was generated with the Chromosome viewer of ePlant v3 using
        the BAR api
      </div>
    )
  },
}
export default ChromosomeViewer
