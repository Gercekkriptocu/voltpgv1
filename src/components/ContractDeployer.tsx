'use client'
import { useState, useEffect, useRef, memo } from 'react'
import { useAccount } from 'wagmi'
import type { ReactElement } from 'react'
import { playRetroSound } from '@/utils/retro-sounds'
import { useNetwork } from '@/contexts/NetworkContext'
import { CustomizeTokenModal } from './CustomizeTokenModal'
import { CustomizeNFTModal } from './CustomizeNFTModal'

// Kontrat kaynak kodları ve bytecode'ları
const CONTRACTS = {
  COUNTER: {
    name: 'COUNTER',
    icon: '[##]',
    description: 'Artırma ve azaltma işlevi olan sayaç',
    bytecode: '0x608060405234801561001057600080fd5b5061015f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80632baeceb714610046578063d09de08a14610050578063f5c9d9e31461005a575b600080fd5b61004e610064565b005b6100586100a0565b005b6100626100dc565b005b600080541115610073576100a0565b6000808154809291906001900391905055505b565b6001600080828254610092919061012e565b925050819055505056fea264697066735822122098765432109876543210987654321098765432109876543210987654321098765064736f6c63430008130033',
    gas: '0x2DC6C0', // 3,000,000 - HEX FORMAT!
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {
    uint256 public count = 0;
    
    function increment() public {
        count += 1;
    }
    
    function decrement() public {
        if (count > 0) {
            count -= 1;
        }
    }
    
    function reset() public {
        count = 0;
    }
}`,
  },
  STORAGE: {
    name: 'STORAGE',
    icon: '[▓▓]',
    description: 'Sayı saklama ve geri çağırma',
    bytecode: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220f4c1e9c3d5a7b6e8f2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a064736f6c63430008130033',
    gas: '0x2DC6C0',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`,
  },
  TOKEN: {
    name: 'TOKEN',
    icon: '($)',
    description: 'ERC20 token transfer işlevi',
    bytecode: '0x608060405234801561000f575f80fd5b50620f42405f803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055506102e58061005f5f395ff3fe608060405234801561000f575f80fd5b506004361061003f575f3560e01c806318160ddd1461004357806370a0823114610061578063a9059cbb14610091575b5f80fd5b61004b6100c1565b60405161005891906101b3565b60405180910390f35b61007b600480360381019061007691906101fc565b6100c7565b60405161008891906101b3565b60405180910390f35b6100ab60048036038101906100a69190610227565b6100dc565b6040516100b89190610280565b60405180910390f35b620f424081565b5f6020528060525f20905f91509050505481565b5f815f803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205410156101295760059050610182565b815f803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546101749190610299565b92505081905550809150505b92915050565b5f819050919050565b6101ad81610188565b82525050565b5f6020820190506101c65f8301846101a4565b92915050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6101f9826101d0565b9050919050565b610209816101ef565b8114610213575f80fd5b50565b5f8135905061022481610200565b92915050565b5f806040838503121561024057610248016101cc565b5b5f61024d85828601610216565b925050602061025e85828601610216565b9150509250929050565b5f8115159050919050565b61027a81610268565b82525050565b5f6020820190506102935f830184610271565b92915050565b5f6102a382610188565b91506102ae83610188565b92508282039050818111156102c6576102c56102cc565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffdfea2646970667358221220c8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a864736f6c63430008180033',
    gas: '0x2DC6C0',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleToken {
    uint256 public constant totalSupply = 1000000;
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) 
        public 
        returns (bool) 
    {
        if (balanceOf[msg.sender] < amount) {
            return false;
        }
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}`,
  },
  NFT: {
    name: 'NFT',
    icon: '[*]',
    description: 'ERC721 NFT mint işlevi',
    bytecode: '0x608060405234801561001057600080fd5b506102a9806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806306661abd146100465780636352211e14610064578063a0712d6814610094575b600080fd5b61004e6100b0565b60405161005b91906101ab565b60405180910390f35b61007e60048036038101906100799190610252565b6100b6565b60405161008b91906102cc565b60405180910390f35b6100ae60048036038101906100a99190610252565b6100e8565b005b60005481565b60016020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160008082825461011291906102e7565b92505081905550806001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000819050919050565b6101a58161017e565b82525050565b60006020820190506101c0600083018461019c565b92915050565b600080fd5b6101d38161017e565b81146101de57600080fd5b50565b6000813590506101f0816101ca565b92915050565b60006020828403121561020c5761020b6101c6565b5b600061021a848285016101e1565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061024e82610223565b9050919050565b61025e81610243565b82525050565b60006020820190506102796000830184610255565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006102b98261017e565b91506102c48361017e565b9250828201905080821115610485576104846102de565b5b9291505056fea264697066735822122045d3e8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f064736f6c63430008130033',
    gas: '0x2DC6C0',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleNFT {
    uint256 public tokenCounter;
    mapping(uint256 => address) public ownerOf;
    
    function mint(address to) public {
        tokenCounter++;
        ownerOf[tokenCounter] = to;
    }
}`,
  },
  GREETER: {
    name: 'GREETER',
    icon: '(:)',
    description: 'Ziyaretçi sayacı - ziyaret sayısını takip eder',
    bytecode: '0x608060405234801561001057600080fd5b50610175806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630c49c36c1461004657806327810b6e146100645780633fa4f2451461006e575b600080fd5b61004e61008c565b60405161005b91906100e1565b60405180910390f35b61006c610092565b005b6100766100ce565b60405161008391906100e1565b60405180910390f35b60015481565b600160008082546100a39190610132565b92505081905550600160025f8282546100bc9190610132565b92505081905550565b60025481565b6000819050919050565b6100db816100d4565b82525050565b60006020820190506100f660008301846100d2565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061013c826100d4565b9150610147836100d4565b925082820190508082111561015f5761015e6100fc565b5b92915050565bfea2646970667358221220abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345678964736f6c63430008130033',
    gas: '0x2DC6C0',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Greeter {
    uint256 public visitsToday;
    uint256 public totalVisits;
    
    function visit() public {
        visitsToday++;
        totalVisits++;
    }
    
    function getVisitsToday() 
        public 
        view 
        returns (uint256) 
    {
        return visitsToday;
    }
    
    function getTotalVisits() 
        public 
        view 
        returns (uint256) 
    {
        return totalVisits;
    }
}`,
  },
} as const

type ContractKey = keyof typeof CONTRACTS

interface ContractDeployerProps {
  onLog: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
}

// 🔥 REACT.MEMO - Gereksiz re-render'ları önle
const ContractDeployerComponent = function ContractDeployer({ onLog }: ContractDeployerProps): ReactElement {
  const { address, isConnected } = useAccount()
  const { currentNetwork } = useNetwork()
  const [selectedContract, setSelectedContract] = useState<ContractKey>('COUNTER')
  const [loading, setLoading] = useState(false)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showNFTModal, setShowNFTModal] = useState(false)
  const [customBytecode, setCustomBytecode] = useState<string | null>(null)
  const [customContractName, setCustomContractName] = useState<string | null>(null)
  const [deployedTokenInfo, setDeployedTokenInfo] = useState<{name: string; symbol: string; supply: string} | null>(null)
  const [deployedNFTInfo, setDeployedNFTInfo] = useState<{name: string; symbol: string} | null>(null)
  
  const prevContractRef = useRef<ContractKey>('COUNTER')

  // Kontrat değiştiğinde ses çal
  useEffect(() => {
    if (prevContractRef.current !== selectedContract) {
      playRetroSound.switch()
      prevContractRef.current = selectedContract
    }
  }, [selectedContract])
  
  // 💥 WINDOW DEBUG - Manuel reset için
  useEffect(() => {
    (window as any).resetDeploy = () => {
      console.log('🔧 MANUAL RESET TRIGGERED FROM CONSOLE')
      setLoading(false)
      onLog('🔧 Manual reset executed', 'success')
    }
    
    return () => {
      delete (window as any).resetDeploy
    }
  }, [onLog])

  // 🎯 DEPLOY FUNCTION - Rehberdeki tam çözüm
  const deployContract = async (customParams?: {
    bytecode: string
    contractName: string
    tokenInfo?: { name: string; symbol: string; supply: string }
    nftInfo?: { name: string; symbol: string }
    abi?: any[]
  }): Promise<void> => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚀 DEPLOY BAŞLADI - Rehber çözümü')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    alert('🎯 deployContract() FUNCTION ENTERED!\n\nThis means handleNFTCustomize successfully called deployContract.\n\nNow checking MetaMask and sending transaction...')
    
    // 1️⃣ Ses efekti çal
    try {
      playRetroSound.coin()
      console.log('🔊 Coin sesi çalıyor')
    } catch (soundError) {
      console.log('🔇 Sound play failed:', soundError)
    }
    
    const contract = CONTRACTS[selectedContract]
    
    // 2️⃣ Terminal log'a kayıt
    onLog(`Initiating deployment: ${contract.name}`, 'info')
    
    // 3️⃣ State'leri başlat
    setLoading(true)
    setContractAddress(null) // Clear previous success
    setTxHash(null)
    setDeployedTokenInfo(null)
    setDeployedNFTInfo(null)
    
    try {
      // 4️⃣ MetaMask kontrolü
      if (!window.ethereum) {
        throw new Error('MetaMask or another Ethereum wallet is required')
      }
      
      console.log('✅ MetaMask bulundu')

      // 5️⃣ Wallet hesaplarını al
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      const account = accounts[0]
      
      console.log('✅ Account:', account)
      onLog(`📍 Deploying from: ${account.slice(0, 6)}...${account.slice(-4)}`, 'info')
      
      // 6️⃣ Chain ID kontrolü ve gerekirse ağ değiştir
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      }) as string
      
      console.log('🔍 Current chain ID:', chainId)
      
      const targetChainId = '0x' + currentNetwork.chainId.toString(16)
      console.log('🎯 Target chain ID:', targetChainId, `(${currentNetwork.name})`)

      if (chainId !== targetChainId) {
        console.log(`⚠️ Wrong network! Switching to ${currentNetwork.name}...`)
        onLog(`⚠️ Switching to ${currentNetwork.name} network...`, 'warning')
        
        // Ağ değiştirme işlemi
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          })
          console.log('✅ Network switched')
          onLog(`✅ Network switched to ${currentNetwork.name}`, 'success')
        } catch (err: any) {
          // Ağ yoksa ekle (code 4902)
          if (err.code === 4902) {
            console.log('⚠️ Network not found, adding...')
            onLog(`⚠️ Adding ${currentNetwork.name} network...`, 'warning')
            
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: currentNetwork.name,
                rpcUrls: [currentNetwork.rpcUrl],
                blockExplorerUrls: [currentNetwork.explorerUrl],
                nativeCurrency: currentNetwork.nativeCurrency,
              }],
            })
            console.log('✅ Network added')
            onLog(`✅ ${currentNetwork.name} network added`, 'success')
          } else {
            throw err
          }
        }
      } else {
        console.log('✅ Already on GIWA Sepolia')
      }

      // 7️⃣ Deploy statusunu güncelle
      onLog('░▒▓ DEPLOYING CONTRACT ▓▒░', 'info')
      
      // 8️⃣ Kontrat bilgilerini al
      const bytecode = customParams?.bytecode || customBytecode || contract.bytecode
      const gasLimit = contract.gas // '0x2DC6C0' = 3,000,000
      const contractName = customParams?.contractName || customContractName || contract.name
      
      console.log('📝 Bytecode length:', bytecode.length)
      console.log('⛽ Gas limit:', gasLimit, '(', parseInt(gasLimit, 16).toLocaleString(), ')')
      onLog(`📝 Bytecode length: ${bytecode.length} chars`, 'info')
      onLog(`⛽ Gas limit: ${parseInt(gasLimit, 16).toLocaleString()}`, 'info')

      // 9️⃣ Transaction gönder - ÖNEMLİ KISIM!
      console.log('📤 Sending transaction...')
      alert('📤 About to send transaction to MetaMask!\n\nFrom: ' + account + '\nGas: ' + parseInt(gasLimit, 16) + '\n\nMetaMask should open NOW...')
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          data: bytecode,
          gas: gasLimit, // Gas limit mutlaka belirtilmeli! HEX FORMAT!
        }],
      }) as string
      
      alert('✅ Transaction sent!\n\nTX Hash: ' + txHash)

      console.log('✅ Transaction sent:', txHash)
      onLog(`📤 Transaction sent: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`, 'success')

      // 🔟 Konfirmasyon bekle
      onLog('░▒▓ CONFIRMING TRANSACTION ▓▒░', 'info')
      
      // 1️⃣1️⃣ Receipt kontrolü - KRİTİK NOKTA!
      let receipt = null
      let attempts = 0
      const maxAttempts = 60 // 60 deneme = 120 saniye

      console.log(`⏳ Polling for receipt (max ${maxAttempts} attempts)...`)

      while (!receipt && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000)) // 2 saniye bekle

        try {
          // RPC'ye receipt sorgusu yap - MANUEL FETCH!
          const response = await fetch(currentNetwork.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [txHash],
              id: 1,
            }),
          })

          const data = await response.json()
          
          console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts}:`, data.result ? 'Receipt found!' : 'No receipt yet')
          
          // Contract adresi geldi mi?
          if (data.result?.contractAddress) {
            receipt = data.result
            console.log('✅ Receipt with contract address found!')
            break // Döngüden çık
          }
        } catch (e) {
          console.log(`⏳ Waiting... (attempt ${attempts + 1}/${maxAttempts})`)
        }

        attempts++
        
        // Progress update every 10 attempts (20s)
        if (attempts % 10 === 0) {
          const elapsed = (attempts * 2)
          onLog(`⏳ Still waiting... ${elapsed}s elapsed`, 'info')
        }
      }

      // 1️⃣2️⃣ Sonuç kontrolü
      if (receipt?.contractAddress) {
        console.log('🎉 DEPLOYMENT SUCCESSFUL!')
        console.log('📍 Contract Address:', receipt.contractAddress)
        console.log('⛽ Gas Used:', parseInt(receipt.gasUsed, 16).toLocaleString())
        
        // Set success states for UI display
        setContractAddress(receipt.contractAddress)
        setTxHash(txHash)
        
        // Save to localStorage for use in Transfer and Interact tabs
        const deployedContract = {
          address: receipt.contractAddress,
          type: selectedContract,
          name: contractName,
          network: currentNetwork.name,
          networkId: currentNetwork.chainId,
          timestamp: Date.now(),
          txHash: txHash
        }
        
        const existingContracts = JSON.parse(localStorage.getItem('deployedContracts') || '[]')
        existingContracts.push(deployedContract)
        localStorage.setItem('deployedContracts', JSON.stringify(existingContracts))
        console.log('💾 Contract saved to localStorage:', deployedContract)
        
        onLog('✓ DEPLOYMENT SUCCESSFUL ✓', 'success')
        onLog(`📍 Contract Address: ${receipt.contractAddress}`, 'success')
        onLog(`⛽ Gas Used: ${parseInt(receipt.gasUsed, 16).toLocaleString()}`, 'info')
        onLog(`🔗 Explorer: ${currentNetwork.explorerUrl}/address/${receipt.contractAddress}`, 'info')
        
        // Set deployed info for success display
        if (customParams?.tokenInfo) {
          setDeployedTokenInfo(customParams.tokenInfo)
        }
        if (customParams?.nftInfo) {
          setDeployedNFTInfo(customParams.nftInfo)
        }
        
        // AUTO-MINT: Automatically mint first NFT to deployer
        if (customParams?.nftInfo && customParams?.abi) {
          try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            console.log('🎨 AUTO-MINTING FIRST NFT...')
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            onLog('🎨 Minting first NFT to your address...', 'info')
            
            // Find mint function in ABI
            const mintFunction = customParams.abi.find((fn: any) => fn.name === 'mint' && fn.type === 'function')
            
            if (!mintFunction) {
              console.warn('⚠️ Mint function not found in ABI - skipping auto-mint')
              onLog('💡 Use mint() function to create NFTs', 'info')
            } else {
              // Encode mint function call: mint(address to)
              const { encodeFunctionData } = await import('viem')
              const mintData = encodeFunctionData({
                abi: customParams.abi,
                functionName: 'mint',
                args: [account] // Mint to deployer
              })
              
              console.log('📤 Encoded mint call:', mintData.slice(0, 20) + '...')
              
              // Send mint transaction
              const mintTxHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                  from: account,
                  to: receipt.contractAddress,
                  data: mintData,
                  gas: '0x186A0', // 100,000 gas
                }],
              }) as string
              
              console.log('✅ Mint transaction sent:', mintTxHash)
              onLog(`✅ First NFT minted! TX: ${mintTxHash.slice(0, 10)}...`, 'success')
              onLog(`🔗 View TX: ${currentNetwork.explorerUrl}/tx/${mintTxHash}`, 'info')
            }
          } catch (mintError: any) {
            console.error('❌ Auto-mint failed:', mintError)
            onLog('⚠️ Auto-mint failed. Use mint() function manually.', 'warning')
            onLog(`💡 Call mint(${account}) on contract`, 'info')
          }
        }
        
        // Auto-mint for tokens with constructor supply
        if (customParams?.abi && customParams?.tokenInfo) {
          onLog('✓ Tokens auto-minted to your address via constructor', 'success')
          onLog(`💰 Balance: ${Number(customParams.tokenInfo.supply).toLocaleString()} ${customParams.tokenInfo.symbol}`, 'info')
        }
      } else {
        console.log('⏰ Transaction timeout - still pending')
        onLog('⏰ Transaction still pending after 120s', 'warning')
        onLog(`🔗 Check transaction: ${currentNetwork.explorerUrl}/tx/${txHash}`, 'info')
        throw new Error('Transaction timeout')
      }

    } catch (error: any) {
      console.error('❌ Deployment error:', error)
      const errorMessage = error.message || 'Deploy failed'
      onLog('✗ ERROR: ' + errorMessage.toUpperCase(), 'error')
      
      // Hata türüne göre mesaj
      if (errorMessage.includes('insufficient')) {
        onLog('💰 Insufficient ETH balance! Get ETH from faucet.', 'error')
      } else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        onLog('🚫 Transaction rejected by user.', 'warning')
      } else if (errorMessage.includes('gas')) {
        onLog('⛽ Gas estimation failed. Check gas limit.', 'error')
      }
    } finally {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🏁 DEPLOY BİTTİ - Loading false')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      setLoading(false)
      setCustomBytecode(null)
      setCustomContractName(null)
    }
  }
  
  const handleTokenCustomize = async (params: { name: string; symbol: string; initialSupply: string; bytecode: string; abi: any[] }): Promise<void> => {
    setSelectedContract('TOKEN')
    onLog(`📝 Custom token configured: ${params.name} (${params.symbol})`, 'info')
    onLog(`📊 Initial supply: ${params.initialSupply} tokens`, 'info')
    onLog(`⚙️ Contract compiled with ${params.abi.length} functions`, 'info')
    
    // CRITICAL: Encode constructor parameter (initialSupply) and append to bytecode
    try {
      const { encodeAbiParameters, parseAbiParameters } = await import('viem')
      
      // Convert initialSupply to proper format (token count, not wei)
      const supplyParam = BigInt(params.initialSupply)
      
      onLog(`🔧 Encoding constructor parameter: ${params.initialSupply}`, 'info')
      
      // Encode the constructor parameter (uint256 initialSupply)
      const encodedParams = encodeAbiParameters(
        parseAbiParameters('uint256'),
        [supplyParam]
      )
      
      onLog(`✅ Encoded: ${encodedParams}`, 'info')
      
      // Append encoded parameters to bytecode (remove 0x prefix from encoded params)
      const fullBytecode = params.bytecode + encodedParams.slice(2)
      
      onLog(`📦 Final bytecode length: ${fullBytecode.length} chars`, 'info')
      
      // Auto-deploy with constructor-encoded bytecode
      await deployContract({
        bytecode: fullBytecode,
        contractName: `${params.name} (${params.symbol})`,
        tokenInfo: { name: params.name, symbol: params.symbol, supply: params.initialSupply },
        abi: params.abi
      })
    } catch (error: any) {
      console.error('❌ Constructor encoding failed:', error)
      onLog(`❌ Failed to encode constructor: ${error.message}`, 'error')
    }
  }
  
  const handleNFTCustomize = async (params: { name: string; symbol: string; bytecode: string; abi: any[]; baseURI: string; imageUrl: string }): Promise<void> => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 handleNFTCustomize CALLED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 Params:', {
      name: params.name,
      symbol: params.symbol,
      baseURI: params.baseURI,
      imageUrl: params.imageUrl,
      bytecodeLength: params.bytecode.length,
      abiLength: params.abi.length
    })
    
    // CRITICAL VALIDATION: Check baseURI format BEFORE encoding
    console.log('🔍 Validating baseURI before deployment...')
    if (!params.baseURI || params.baseURI.trim() === '') {
      const error = new Error('baseURI is empty or null')
      console.error('❌ VALIDATION FAILED:', error.message)
      onLog('❌ baseURI validation failed: Empty or null', 'error')
      throw error
    }
    if (!params.baseURI.startsWith('ipfs://')) {
      const error = new Error(`baseURI must start with ipfs://, got: ${params.baseURI}`)
      console.error('❌ VALIDATION FAILED:', error.message)
      onLog(`❌ baseURI validation failed: Must start with ipfs://`, 'error')
      throw error
    }
    // Note: baseURI no longer needs to end with '/' since we use a single metadata file
    console.log('✅ baseURI validation passed')
    onLog('✅ baseURI format validated successfully', 'success')
    
    setSelectedContract('NFT')
    onLog(`📝 Custom NFT configured: ${params.name} (${params.symbol})`, 'info')
    onLog(`⚙️ Contract compiled with ${params.abi.length} functions`, 'info')
    onLog(`🖼️ Collection image uploaded to IPFS`, 'success')
    onLog(`🔗 Base URI: ${params.baseURI}`, 'info')
    
    // CRITICAL: Encode constructor parameter (baseURI) and append to bytecode
    try {
      console.log('🔧 Starting constructor encoding...')
      onLog(`🔧 Encoding constructor parameter (baseURI)...`, 'info')
      
      console.log('📦 Importing viem...')
      const { encodeAbiParameters, parseAbiParameters } = await import('viem')
      console.log('✅ Viem imported successfully')
      
      console.log('🔧 Encoding baseURI:', params.baseURI)
      // Encode the constructor parameter (string baseURI)
      const encodedParams = encodeAbiParameters(
        parseAbiParameters('string'),
        [params.baseURI]
      )
      
      console.log('✅ Parameters encoded:', encodedParams.slice(0, 66) + '...')
      onLog(`✅ Constructor parameter encoded`, 'success')
      
      // Append encoded parameters to bytecode (remove 0x prefix from encoded params)
      const fullBytecode = params.bytecode + encodedParams.slice(2)
      
      console.log('📦 Bytecode stats:')
      console.log('   - Original bytecode length:', params.bytecode.length)
      console.log('   - Encoded params length:', encodedParams.length - 2)
      console.log('   - Full bytecode length:', fullBytecode.length)
      onLog(`📦 Final bytecode: ${fullBytecode.length} chars (bytecode + constructor)`, 'info')
      
      // Terminal feedback BEFORE calling deployContract
      onLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
      onLog('🚀 READY FOR BLOCKCHAIN DEPLOYMENT', 'success')
      onLog('⏳ Opening MetaMask...', 'warning')
      onLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info')
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🚀 CALLING deployContract() NOW...')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Check MetaMask availability BEFORE calling deployContract
      alert('🔍 Checking MetaMask...\n\nPlease wait')
      
      if (!window.ethereum) {
        console.error('❌ CRITICAL: window.ethereum is undefined!')
        console.error('   MetaMask or another Web3 wallet must be installed.')
        onLog('❌ MetaMask not found! Please install MetaMask extension.', 'error')
        alert('❌ MetaMask Not Found\n\nPlease install the MetaMask browser extension to deploy contracts.')
        return
      }
      console.log('✅ window.ethereum found:', !!window.ethereum)
      alert('✅ MetaMask found!\n\nNow calling deployContract function...')
      
      // Auto-deploy with constructor-encoded bytecode
      console.log('📤 Calling deployContract with params:', {
        bytecodeLength: fullBytecode.length,
        contractName: `${params.name} (${params.symbol})`,
        nftInfo: { name: params.name, symbol: params.symbol },
        abiLength: params.abi.length
      })
      
      alert('📞 CALLING deployContract() now...\n\nBytecode length: ' + fullBytecode.length + '\nContract: ' + params.name + '\n\nClick OK to proceed')
      
      await deployContract({
        bytecode: fullBytecode,
        contractName: `${params.name} (${params.symbol})`,
        nftInfo: { name: params.name, symbol: params.symbol },
        abi: params.abi
      })
      
      alert('✅ deployContract() returned successfully!')
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ deployContract() COMPLETED SUCCESSFULLY')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ handleNFTCustomize ERROR CAUGHT')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error code:', error?.code)
      console.error('Error stack:', error?.stack)
      console.error('Full error object:', error)
      
      onLog(`❌ NFT deployment failed: ${error.message}`, 'error')
      
      // User-friendly error messages
      let userMessage = '❌ NFT Deployment Failed\n\n'
      
      if (error.message.includes('MetaMask')) {
        userMessage += '🦊 MetaMask Issue\n'
        userMessage += error.message + '\n\n'
        userMessage += '💡 Solutions:\n'
        userMessage += '- Install MetaMask browser extension\n'
        userMessage += '- Unlock your MetaMask wallet\n'
        userMessage += '- Refresh the page and try again'
      } else if (error.message.includes('rejected') || error.message.includes('denied')) {
        userMessage += '🚫 Transaction Rejected\n'
        userMessage += 'You rejected the transaction in MetaMask.\n\n'
        userMessage += '💡 To deploy, click DEPLOY again and approve the transaction.'
      } else if (error.message.includes('insufficient')) {
        userMessage += '💰 Insufficient Funds\n'
        userMessage += 'You don\'t have enough ETH to deploy.\n\n'
        userMessage += '💡 Get testnet ETH from a faucet.'
      } else {
        userMessage += error.message + '\n\n'
        userMessage += '💡 Check browser console (F12) for details.'
      }
      
      alert(userMessage)
      throw error // Re-throw to propagate to modal
    }
  }

  return (
    <>
      {/* Modals */}
      <CustomizeTokenModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onDeploy={handleTokenCustomize}
      />
      <CustomizeNFTModal
        isOpen={showNFTModal}
        onClose={() => setShowNFTModal(false)}
        onDeploy={handleNFTCustomize}
      />
      
    <div className="retro-panel p-4 space-y-4">
      <div className="retro-text text-center mb-3">
        <span className="blink text-sm">╔═══════════════════╗</span>
        <div className="text-sm my-1">║ CONTRACT DEPLOYER ║</div>
        <span className="blink text-sm">╚═══════════════════╝</span>
      </div>

      {/* Contract Selection Grid */}
      <div className="space-y-3">
        <label className="block retro-text text-xs">
          <span className="blink">&gt;</span> SELECT CONTRACT:
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(CONTRACTS).map(([key, contract]) => {
            const isSelected = selectedContract === key
            const isCustomizable = key === 'TOKEN' || key === 'NFT'
            
            return (
              <div key={key} className="relative">
                <button
                  onClick={() => setSelectedContract(key as ContractKey)}
                  disabled={loading}
                  className={`
                    w-full relative p-3 rounded border-2 font-mono text-xs transition-all
                    ${isSelected 
                      ? 'border-green-400 bg-green-900/40 text-green-300' 
                      : 'border-green-500/40 bg-black/60 text-green-400 hover:border-green-400 hover:bg-green-900/20'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    disabled:opacity-50
                  `}
                >
                  <div className="text-3xl mb-2 font-bold">{contract.icon}</div>
                  <div className="text-[10px] leading-tight opacity-80">
                    {contract.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <span className="text-green-400 animate-pulse">▶</span>
                    </div>
                  )}
                </button>
                
                {/* Customize Button for TOKEN and NFT */}
                {isCustomizable && (
                  <button
                    onClick={() => {
                      if (key === 'TOKEN') {
                        setShowTokenModal(true)
                        playRetroSound.coin()
                      } else if (key === 'NFT') {
                        setShowNFTModal(true)
                        playRetroSound.coin()
                      }
                    }}
                    disabled={loading}
                    className={`w-full mt-1 text-black px-2 py-1 rounded font-mono text-[10px] font-bold transition-all disabled:opacity-50 ${
                      currentNetwork.chainId === 91342
                        ? 'bg-green-500 hover:bg-green-400' // GIWA Sepolia - Yeşil
                        : currentNetwork.chainId === 5042002
                        ? 'bg-gray-500 hover:bg-gray-400' // ARC Network - Gri
                        : currentNetwork.chainId === 2201
                        ? 'bg-green-700 hover:bg-green-600' // Stable Testnet - Koyu Yeşil
                        : 'bg-yellow-600 hover:bg-yellow-500' // Fallback - Sarı
                    }`}
                  >
                    CUSTOMIZE
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected Contract Info */}
        <div className="retro-panel p-3 text-xs space-y-2 border-2 border-green-500/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-green-400 font-bold mb-1">
                {CONTRACTS[selectedContract].icon} {CONTRACTS[selectedContract].name}
              </p>
              <p className="text-green-400/70 mt-1">
                &gt; Gas Limit: {parseInt(CONTRACTS[selectedContract].gas, 16).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Solidity Source Code - Always Visible */}
          <div className="pt-2 border-t border-green-700/50">
            <p className="text-green-400 text-xs mb-1 flex items-center gap-1">
              <span className="animate-pulse">▶</span> SOURCE:
            </p>
            <pre className="text-xs p-3 bg-black/80 border border-green-500/30 rounded overflow-x-auto text-green-400 max-h-64 overflow-y-auto font-mono leading-relaxed">
{CONTRACTS[selectedContract].sourceCode}
            </pre>
          </div>
        </div>
      </div>

      {/* Deploy Button */}
      <button
        onClick={deployContract}
        disabled={!isConnected || loading}
        className={`w-full p-3 rounded font-mono font-bold text-sm transition-all ${
          loading
            ? 'bg-yellow-600 text-black cursor-wait animate-pulse'
            : isConnected
            ? 'bg-green-600 hover:bg-green-500 text-black hover:shadow-lg hover:shadow-green-500/50'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <span className="blink">⏳ DEPLOYING...</span>
        ) : !isConnected ? (
          '🔒 CONNECT WALLET FIRST'
        ) : (
          `[>>] DEPLOY ${CONTRACTS[selectedContract].icon}`
        )}
      </button>

      {!isConnected && (
        <p className="text-xs text-center text-yellow-400 retro-text">
          <span className="blink">!</span> Cüzdanınızı bağlayın
        </p>
      )}

      {/* Success Message - Efektli Terminal Görünümü */}
      {contractAddress && txHash && (
        <div className="retro-panel bg-green-900/20 border-2 border-green-400 p-4 space-y-3">
          {/* ASCII Art Success Banner */}
          <div className="text-center font-mono">
            <div className="text-green-400 text-xs leading-none">
              ╔═══════════════════════════════════════╗
            </div>
            <div className="text-green-300 font-bold text-sm py-2 blink">
              ✓ DEPLOYMENT SUCCESSFUL ✓
            </div>
            <div className="text-green-400 text-xs leading-none">
              ╚═══════════════════════════════════════╝
            </div>
          </div>

          {/* Contract Address */}
          <div className="space-y-1">
            <p className="text-green-400 text-xs font-mono">
              <span className="animate-pulse">▶</span> CONTRACT ADDRESS:
            </p>
            <div className="bg-black/60 border border-green-500/50 rounded p-2">
              <a
                href={`${currentNetwork.explorerUrl}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 text-xs font-mono break-all hover:text-green-100 transition-colors underline"
              >
                {contractAddress}
              </a>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-1">
            <p className="text-green-400 text-xs font-mono">
              <span className="animate-pulse">▶</span> TRANSACTION HASH:
            </p>
            <div className="bg-black/60 border border-green-500/50 rounded p-2">
              <a
                href={`${currentNetwork.explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 text-xs font-mono break-all hover:text-green-100 transition-colors underline"
              >
                {txHash}
              </a>
            </div>
          </div>

          {/* Token Details (if TOKEN deployed) */}
          {deployedTokenInfo && (
            <div className="space-y-2 pt-2 border-t border-green-700/50">
              <p className="text-green-400 text-xs font-mono font-bold">
                <span className="animate-pulse">▶</span> TOKEN DETAILS:
              </p>
              <div className="bg-black/60 border border-green-500/50 rounded p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400/70">Name:</span>
                  <span className="text-green-300 font-bold">{deployedTokenInfo.name}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400/70">Symbol:</span>
                  <span className="text-green-300 font-bold">{deployedTokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400/70">Initial Supply:</span>
                  <span className="text-green-300 font-bold">{Number(deployedTokenInfo.supply).toLocaleString()}</span>
                </div>
                <div className="text-xs text-green-400/60 pt-2 border-t border-green-700/30">
                  ✓ All tokens minted to your address
                </div>
              </div>
            </div>
          )}

          {/* NFT Details (if NFT deployed) */}
          {deployedNFTInfo && (
            <div className="space-y-2 pt-2 border-t border-green-700/50">
              <p className="text-green-400 text-xs font-mono font-bold">
                <span className="animate-pulse">▶</span> NFT COLLECTION DETAILS:
              </p>
              <div className="bg-black/60 border border-green-500/50 rounded p-3 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400/70">Collection:</span>
                  <span className="text-green-300 font-bold">{deployedNFTInfo.name}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400/70">Symbol:</span>
                  <span className="text-green-300 font-bold">{deployedNFTInfo.symbol}</span>
                </div>
                <div className="text-xs text-green-400/60 pt-2 border-t border-green-700/30">
                  🎨 First NFT minted to your address
                </div>
              </div>
            </div>
          )}

          {/* Explorer Links */}
          <div className="flex gap-2 pt-2">
            <a
              href={`${currentNetwork.explorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white hover:bg-gray-100 text-black text-xs font-mono font-bold py-2 px-3 rounded transition-all text-center border-2 border-green-400"
            >
              📍 VIEW CONTRACT →
            </a>
            <a
              href={`${currentNetwork.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white hover:bg-gray-100 text-black text-xs font-mono font-bold py-2 px-3 rounded transition-all text-center border-2 border-green-400"
            >
              🔗 VIEW TX →
            </a>
          </div>

          {/* ASCII Art Bottom Decoration */}
          <div className="text-center text-green-400/50 text-xs font-mono pt-2">
            ░▒▓█ SUCCESS █▓▒░
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// 🔥 EXPORT WITH REACT.MEMO
export const ContractDeployer = memo(ContractDeployerComponent, (prevProps, nextProps) => {
  // Only re-render if onLog reference changes (which it shouldn't)
  return prevProps.onLog === nextProps.onLog
})
