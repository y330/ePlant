// -------
// IMPORTS
// -------
import React, { FC, useEffect, useState } from "react";

import GeneticElement from "@eplant/GeneticElement";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Popover from "@mui/material/Popover";
import Typography from '@mui/material/Typography';

import { CentromereList, ChromosomeItem } from "../types";

import GeneList from "./GeneList";
//----------
// TYPES
//----------
interface ChromosomeProps {
	chromosome: ChromosomeItem,
	geneticElement: GeneticElement
}
interface Range {
	start: number,
	end: number
}
// COMPONENT
//----------
const Chromosome: FC<ChromosomeProps> = ({ chromosome, geneticElement }) => {
	// State
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [anchorOrigin, setAnchorOrigin] = useState<number[]>([]);
	const [geneRange, setGeneRange] = useState<Range>({
		start: 0,
		end: 0,
	});
	const [geneticElementLocation, setGeneticElementLocation] = useState<number[]>([])
	// SVG drawing
	const centromeres: CentromereList = chromosome.centromeres;
	const hasCentromeres: boolean = centromeres.length > 0;
	const lastCentromereEnd: number = hasCentromeres
		? centromeres[centromeres.length - 1].end
		: 0;

	const x: number = 10;
	const y: number = 0;
	const width: number = 10;
	const perBpHeight: number = 0.000015;
	let start: number = 0;

	// Execute on first render
	useEffect(() => {
		const svg: HTMLElement & SVGSVGElement = getChromosomeSvg();
		// Get the bounds of the SVG content
		const bbox: SVGRect = svg.getBBox();
		// Update the width and height using the size of the contents
		svg.setAttribute("width", `${bbox.x + bbox.width + bbox.x}`);
		svg.setAttribute("height", `${bbox.y + bbox.height + bbox.y}`);
	}, []);


	//------------------
	// Helper Functions
	//------------------
	/**
	 * Gets the Chromosome svg element.
	 */
	const getChromosomeSvg = (): HTMLElement & SVGSVGElement => {
		const svg = document.getElementById(chromosome.id + "_svg") as HTMLElement &
			SVGSVGElement;
		return svg;
	};
	/**
	 * Gets the Chromosome top y-coordinate.
	 */
	const getChromosomeYCoordinate = (): number => {
		return getChromosomeSvg().getBoundingClientRect().top;
	};
	/**
	 * Gets the height of the Chromosome.
	 */
	const getChromosomeHeight = (): number => {
		return getChromosomeSvg().getBoundingClientRect().height;
	};
	/**
	 * Gets the number of base-pairs per pixel.
	 */
	const getBpPerPixel = (): number => {
		return chromosome.size / (getChromosomeHeight() - 1);
	};
	/**
	 * Gets the number of pixels per base-pair.
	 *
	 * @return {Number} Number of pixels per base-pair.
	 */
	const getPixelsPerBp = () => {
		return 1 / getBpPerPixel();
	};
	/**
	 * Converts a pixel value to the equivalent base-pair range.
	 *
	 * @param {Number} pixel A screen y-coordinate.
	 * @return {Number} Equivalent base-pair range.
	 */
	const pixelToBp = (pixel: number): Range => {
		if (
			pixel > getChromosomeYCoordinate() &&
			pixel < getChromosomeYCoordinate() + getChromosomeHeight()
		) {
			const range = {
				start: Math.floor(
					(pixel - 1 - getChromosomeYCoordinate()) * getBpPerPixel() + 1
				),
				end: Math.floor((pixel - getChromosomeYCoordinate()) * getBpPerPixel()),
			};
			if (range.end > chromosome.size) {
				range.end = chromosome.size;
			}
			return range;
		} else {
			return {
				start: 0,
				end: 0,
			};
		}
	};
	/**
	 * Converts a base-pair value to the equivalent pixel value.
	 *
	 * @param {Number} bp A base-pair value.
	 * @return {Number} Equivalent screen y-coordinate.
	 */
	const bpToPixel = (bp: number) => {
		return getChromosomeYCoordinate() + (bp - 1) * getPixelsPerBp() + 1;
	};
	/**
	 * returns gene location on the chromosome given a gene identifier.
	 *
	 * @return {Number[]} gene location.
	 */
	// const fetchGeneLocation = (id) => {
	// 	const geneSummary = fetch(`https://bar.utoronto.ca/webservices/bar_araport/` +
	// 		`gene_summary_by_locus.php?locus=${id}`
	// 	).then((res) => {
	// 		console.log(res.data.result[0])
	// 	})
	// 	// console.log(geneSummary)
	// 	const geneLocation = [0, 0]
	// 	return geneLocation
	// }

	//--------------
	//Event Handling
	//--------------
	// Handle click on chromosome
	const handleClick = (event: MouseEvent) => {
		setAnchorOrigin([event.clientX, event.clientY]);
		setGeneRange(pixelToBp(event.clientY));
	};
	// Handle popup close
	const handleClose = () => {
		setAnchorOrigin([]);
	};
	// Handle mouse over
	const handleMouseOver = () => {
		setIsHovered(true)
	}
	// Handle mouse leave
	const handleMouseLeave = () => {
		setIsHovered(false)
	}

	// Popover prop variables
	const open: boolean = anchorOrigin.length === 0 ? false : true;

	return (
		<>
			{/* GENETIC ELEMENT LIST POPUP */}


			<Popover

				open={open}
				// onClose={handleClose}
				anchorReference="anchorPosition"
				anchorPosition={{
					left: anchorOrigin[0] + 20,
					top: anchorOrigin[1] - 60,
				}}
				sx={{
					'& .MuiPopover-paper': {
						background: "transparent"
					}
				}}
			>

				<Typography variant="caption" sx={{ fontSize: 9 }}>
					{geneRange.start.toLocaleString()}
				</Typography>

				<ClickAwayListener
					onClickAway={handleClose}
				>

					<Box
						sx={(theme) => ({
							background: theme.palette.background.paper,
							border: 1,
							borderRadius: 0,
							p: 0,
							display: "flex",
							flexDirection: "column",
							width: "200px",
							maxHeight: "100px",
							minHeight: "10vh",
							overflowY: "scroll",
						})}
					>
						{open && (
							<GeneList
								id={chromosome.id}
								start={geneRange.start}
								end={geneRange.end}
								anchorOrigin={anchorOrigin}
							/>
						)}
					</Box>
				</ClickAwayListener>
				<Typography variant="caption" sx={{ fontSize: 9 }}>
					{geneRange.end.toLocaleString()}
				</Typography>


			</Popover >
			{/* arrow pointing to location on chromosome -- in development */}
			{/* {open && (
				<svg height="100" width="100" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", overflow: "visible", left: anchorOrigin[0] - 450, top: anchorOrigin[1] - 350 }}>
					<path stroke="red" d={`M 150 300 L 200 250 L 200 350 Z`}></path>
				</svg >
			)} */}
			{/* =============== */}
			{/* CHROMOSOME SVG */}
			< svg
				id={chromosome.id + "_svg"}
				width="0"
				height="0"
				viewBox="0 0 width height"
				preserveAspectRatio="xMidYMid meet"
				style={{ overflow: "visible", border: "0px blue solid" }
				}
			>
				<g>
					{/*Centromeric Layer  */}
					{hasCentromeres ? (
						<rect
							x={x}
							y={y}
							width={width * 0.6}
							height={chromosome.size * perBpHeight}
							ry={width / 2}
							fill="grey"
						/>
					) : (
						<rect
							x={x}
							y={y}
							width={width}
							height={chromosome.size * perBpHeight}
							ry={"50%"}
							fill="grey"
						/>
					)}
					{/* Non-Centromeric Layers */}
					{/* note: all except last can be drawn in a loop */}
					{hasCentromeres &&
						centromeres.map((centromere, index) => {
							start = index === 0 ? 0 : centromeres[index - 1].end;
							const end = centromere.start;
							return (
								<rect
									x={x - 2}
									y={y + start * perBpHeight}
									width={width}
									height={(end - start) * perBpHeight}
									ry={width / 2}
									fill="gray"
									key={index}
								/>
							);
						})}
					{/* Last Non-Centromeric Layer must be drawn seperately*/}
					{hasCentromeres && (
						<rect
							x={x - 2}
							y={y + lastCentromereEnd * perBpHeight}
							width={width}
							height={(chromosome.size - lastCentromereEnd) * perBpHeight}
							rx={width / 2}
							ry={width / 2}
							fill="gray"
						/>
					)}
					{/* Input Layer (transparent, must be drawn on top of other layers)*/}
					<rect
						id={chromosome.id + "_input"}
						x={x - 2}
						y={y}
						width={width}
						height={chromosome.size * perBpHeight}
						rx={width / 2}
						ry={width / 2}
						fill="transparent"
						onMouseEnter={handleMouseOver}
						onMouseLeave={handleMouseLeave}
						cursor={isHovered ? "pointer" : "default"}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-expect-error
						onClick={handleClick}
					/>

				</g>
			</svg >
		</>
	);
};

export default Chromosome;
